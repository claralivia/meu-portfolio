<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/vue/24/outline'
import { useFound } from '../composables/useSecrets'

type Kind = 'education' | 'volunteer' | 'paused' | 'work'
interface Stop {
  kind: Kind
  start: string // YYYY-MM
  end: string | null // YYYY-MM, or null while it is still going
  date: string
  title: string
  place: string
  note?: string
  summary?: string
  points?: string[]
}

const { t, tm, locale } = useI18n()
const { discover } = useFound()

const monthIndex = (iso: string) => {
  const [y, m] = iso.split('-').map(Number)
  return y * 12 + (m - 1)
}

const stops = computed(() => [...((tm('experience.path') as Stop[]) || [])].sort((a, b) => monthIndex(a.start) - monthIndex(b.start)))

// The bar runs from the first stop to today.
const first = computed(() => monthIndex(stops.value[0]?.start ?? '2018-02'))
const now = new Date()
const nowIndex = now.getFullYear() * 12 + now.getMonth()
const total = computed(() => Math.max(nowIndex - first.value, 1))
const position = (iso: string) => (monthIndex(iso) - first.value) / total.value // 0..1

// The slider position, 0 (first day) to 1000 (today).
const value = ref(1000)
const at = computed(() => first.value + (value.value / 1000) * total.value) // absolute month

// What was going on at that moment. The main card is the job when there is one, otherwise the latest start.
const activeAt = (month: number) =>
  stops.value
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => monthIndex(s.start) <= month + 0.001 && (s.end === null || month <= monthIndex(s.end) + 1))
const mainOf = (month: number) => {
  const list = activeAt(month)
  if (!list.length) {
    // between two stops: the last one that started
    const past = stops.value.map((s, i) => ({ s, i })).filter(({ s }) => monthIndex(s.start) <= month)
    return past[past.length - 1]?.i ?? 0
  }
  const jobs = list.filter(({ s }) => s.kind === 'work')
  const pool = jobs.length ? jobs : list
  return pool[pool.length - 1].i
}
const main = computed(() => mainOf(at.value))
const current = computed(() => stops.value[main.value])
const alongside = computed(() => activeAt(at.value).filter(({ i }) => i !== main.value).map(({ s }) => s))

// The steps you can walk through with the arrows: every stop that is the main card when it begins.
const chapters = computed(() => {
  const seen: number[] = []
  stops.value.forEach((s) => {
    const i = mainOf(monthIndex(s.start))
    if (!seen.includes(i)) seen.push(i)
  })
  return seen
})
const chapterNow = computed(() => Math.max(chapters.value.indexOf(main.value), 0))

const label = computed(() => {
  if (value.value >= 990) return t('experience.today')
  const idx = Math.round(at.value)
  return new Intl.DateTimeFormat(locale.value === 'en' ? 'en-GB' : 'pt-BR', { month: 'long', year: 'numeric' }).format(new Date(Math.floor(idx / 12), idx % 12, 1))
})

// Years under the bar.
const years = computed(() => {
  const y0 = Math.floor(first.value / 12)
  const y1 = now.getFullYear()
  const list: { year: number; p: number }[] = []
  for (let y = y0 + 1; y <= y1; y++) {
    if ((y - y0) % 2 === 0 || y === y1) list.push({ year: y, p: (y * 12 - first.value) / total.value })
  }
  return list.filter((it) => it.p > 0.04 && it.p < 0.97)
})

// The handle is 22px wide, so the ends of the track are inset by half of it.
const at100 = (p: number) => `calc(11px + (100% - 22px) * ${p})`

// Moves the bar smoothly (used by the arrows, the dots and the one-time hint).
let frame = 0
const animateTo = (to: number, ms = 500) =>
  new Promise<void>((resolve) => {
    cancelAnimationFrame(frame)
    const from = value.value
    const t0 = performance.now()
    const step = (time: number) => {
      const p = Math.min((time - t0) / ms, 1)
      value.value = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)))
      if (p < 1) frame = requestAnimationFrame(step)
      else resolve()
    }
    frame = requestAnimationFrame(step)
  })

// When the section first comes into view the bar slides back and forth once, to show it can be moved.
const section = ref<HTMLElement | null>(null)
const touched = ref(false)
// Going all the way back to the first stop is one of the hidden things.
watch([value, touched], ([v, tc]) => {
  if (tc && v <= 5) discover('start', t('secrets.start'))
})
let observer: IntersectionObserver | null = null
onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !section.value) return
  observer = new IntersectionObserver(
    async ([entry]) => {
      if (!entry.isIntersecting) return
      observer?.disconnect()
      await animateTo(0, 1500)
      if (!touched.value) await animateTo(1000, 1500)
    },
    { threshold: 0.5 }
  )
  observer.observe(section.value)
})
onBeforeUnmount(() => {
  observer?.disconnect()
  cancelAnimationFrame(frame)
})
const grab = () => {
  touched.value = true
  cancelAnimationFrame(frame)
}
const jumpTo = (i: number) => {
  touched.value = true
  const p = position(stops.value[i].start)
  animateTo(Math.min(1000, Math.round(p * 1000) + (p === 0 ? 0 : 2)), 450)
}
const step = (dir: 1 | -1) => {
  const target = chapters.value[chapterNow.value + dir]
  if (target !== undefined) jumpTo(target)
}
const canPrev = computed(() => chapterNow.value > 0)
const canNext = computed(() => chapterNow.value < chapters.value.length - 1)
</script>

<template>
  <section id="experience" ref="section" class="py-20 md:py-28">
    <h2 v-reveal class="section-title">{{ t('experience.title') }}</h2>
    <p v-reveal class="mt-3 text-muted">{{ t('experience.lead') }}</p>

    <div v-reveal class="mt-10">
      <p class="font-display font-bold text-ink" style="font-size: clamp(2rem, 6vw, 3.4rem); letter-spacing: -0.035em; line-height: 1; min-height: 1.1em" aria-hidden="true">
        {{ label }}
      </p>

      <div class="scrub-wrap">
        <span v-if="!touched" class="grab" :style="{ left: at100(value / 1000) }" aria-hidden="true">
          <ArrowLeftIcon class="h-3.5 w-3.5" />
          {{ t('experience.grab') }}
          <ArrowRightIcon class="h-3.5 w-3.5" />
        </span>

        <input
          v-model.number="value"
          type="range"
          min="0"
          max="1000"
          step="1"
          class="scrub"
          :style="{ '--v': at100(value / 1000) }"
          :aria-label="t('experience.scrub')"
          :aria-valuetext="`${label}: ${current?.title}`"
          @pointerdown="grab"
          @keydown="grab"
        />

        <!-- One dot for every step. Filled ones are jobs. -->
        <div class="dots" aria-hidden="true">
          <button
            v-for="(s, i) in stops"
            :key="s.title + s.start"
            type="button"
            tabindex="-1"
            class="dot"
            :class="{ 'is-job': s.kind === 'work', 'is-on': i === main }"
            :style="{ left: at100(position(s.start)) }"
            :title="s.title"
            @click="jumpTo(i)"
          ></button>
        </div>

        <div class="years" aria-hidden="true">
          <span v-for="y in years" :key="y.year" :style="{ left: at100(y.p) }">{{ y.year }}</span>
        </div>
      </div>

      <div class="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <p class="text-sm text-muted">{{ t('experience.scrub') }}</p>
        <div class="flex items-center gap-2">
          <button type="button" class="step" :disabled="!canPrev" :aria-label="t('experience.prev')" @click="step(-1)">
            <ArrowLeftIcon class="h-4 w-4" />
          </button>
          <button type="button" class="step" :disabled="!canNext" :aria-label="t('experience.next')" @click="step(1)">
            <ArrowRightIcon class="h-4 w-4" />
          </button>
        </div>
      </div>

      <div class="role mt-10 border-t pt-10 md:mt-14 md:pt-12" style="border-color: var(--line)">
        <Transition name="fade" mode="out-in">
          <article :key="main" class="grid gap-8 md:grid-cols-[1fr_1.1fr] md:gap-16">
            <header>
              <p class="text-sm tabular-nums text-muted">{{ current?.date }}</p>
              <h3 class="mt-2 font-display font-extrabold text-ink" style="font-size: clamp(2rem, 4.6vw, 3.6rem); line-height: 1; letter-spacing: -0.045em; text-wrap: balance">{{ current?.title }}</h3>
              <p class="mt-4 text-lg text-muted">{{ current?.place }}</p>
              <p v-if="current?.note" class="mt-1 text-muted">{{ current.note }}</p>
            </header>
            <div>
              <p v-if="current?.summary" class="max-w-[40ch] font-display text-xl font-semibold text-ink md:text-2xl" style="letter-spacing: -0.02em">{{ current.summary }}</p>
              <ul v-if="current?.points?.length" class="space-y-3 text-[16px] text-ink/85" :class="current?.summary ? 'mt-6' : ''">
                <li v-for="point in current.points" :key="point" class="flex gap-3">
                  <span class="mt-[0.72em] h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden="true"></span>
                  <span>{{ point }}</span>
                </li>
              </ul>
              <p v-if="alongside.length" class="max-w-[62ch] text-sm text-muted" :class="current?.summary || current?.points?.length ? 'mt-8' : ''">
                <span class="font-medium text-ink">{{ t('experience.alongside') }}:</span>
                <template v-for="(s, i) in alongside" :key="s.title">{{ i ? ' · ' : ' ' }}{{ s.title }} ({{ s.place.split(' · ')[0] }})</template>
              </p>
            </div>
          </article>
        </Transition>
      </div>
    </div>
  </section>
</template>

<style scoped>
.scrub-wrap {
  position: relative;
  margin-top: 2.6rem;
  padding-bottom: 2.4rem;
}
/* The slider: a hairline track that fills as you move, and a round handle. */
.scrub {
  position: relative;
  z-index: 2;
  display: block;
  width: 100%;
  height: 2rem;
  margin: 0;
  background: transparent;
  cursor: grab;
  -webkit-appearance: none;
  appearance: none;
  touch-action: pan-y;
}
.scrub:active {
  cursor: grabbing;
}
.scrub::-webkit-slider-runnable-track {
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(to right, rgb(var(--ink)) var(--v, 100%), var(--line) var(--v, 100%));
}
.scrub::-moz-range-track {
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(to right, rgb(var(--ink)) var(--v, 100%), var(--line) var(--v, 100%));
}
.scrub::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 22px;
  height: 22px;
  margin-top: -10px;
  border-radius: 9999px;
  border: 3px solid rgb(var(--surface));
  background: rgb(var(--ink));
  box-shadow: 0 0 0 1px rgb(var(--ink));
  transition: transform 0.15s ease;
}
.scrub::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 9999px;
  border: 3px solid rgb(var(--surface));
  background: rgb(var(--ink));
  box-shadow: 0 0 0 1px rgb(var(--ink));
}
.scrub:hover::-webkit-slider-thumb,
.scrub:active::-webkit-slider-thumb {
  transform: scale(1.12);
}
.scrub:focus-visible {
  outline: none;
}
.scrub:focus-visible::-webkit-slider-thumb {
  box-shadow:
    0 0 0 1px rgb(var(--ink)),
    0 0 0 5px rgb(var(--accent) / 0.4);
}

/* The little label that follows the handle until the first touch. */
.grab {
  position: absolute;
  top: -2.3rem;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  translate: -50% 0;
  border-radius: 9999px;
  padding: 0.25rem 0.7rem;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  background: rgb(var(--ink));
  color: rgb(var(--surface));
  pointer-events: none;
}

/* Dots sit on the track, under the handle. */
.dots {
  position: absolute;
  inset: 0 0 auto;
  height: 2rem;
  pointer-events: none;
}
.dot {
  position: absolute;
  top: 50%;
  z-index: 1;
  width: 9px;
  height: 9px;
  translate: -50% -50%;
  border-radius: 9999px;
  border: 1.5px solid rgb(var(--muted));
  background: rgb(var(--surface));
  pointer-events: auto;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease;
}
.dot.is-job {
  border-color: rgb(var(--accent));
  background: rgb(var(--accent));
}
.dot.is-on {
  transform: scale(1.5);
}

.years {
  position: absolute;
  inset: 2.1rem 0 0;
  font-size: 0.8rem;
  color: rgb(var(--muted));
}
.years span {
  position: absolute;
  top: 0;
  translate: -50% 0;
}

.step {
  display: flex;
  height: 2.5rem;
  width: 2.5rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  border: 1px solid var(--line);
  color: rgb(var(--ink));
  transition:
    background-color 0.2s ease,
    opacity 0.2s ease;
}
.step:hover:not(:disabled) {
  background: rgb(var(--ink) / 0.06);
}
.step:disabled {
  opacity: 0.35;
}

.role {
  min-height: 20rem;
}
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }
}
</style>
