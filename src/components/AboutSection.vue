<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import HobbyIcon from './icons/HobbyIcon.vue'
import { ArrowRightIcon } from '@heroicons/vue/24/outline'
import { useAnalytics } from '../composables/useAnalytics'
import { useFound } from '../composables/useSecrets'
import profilePicture from '../assets/minha-foto.webp'

interface Hobby {
  icon: string
  title: string
  text: string
}

const { t, tm, locale } = useI18n()
const { trackClick } = useAnalytics()
const { discover } = useFound()

// The tags are things she likes. Pressing one shows her own line about it.
const hobbies = computed(() => (tm('aboutPage.hobbies') as Hobby[]) || [])
const open = ref(-1)
const toggle = (i: number) => {
  open.value = open.value === i ? -1 : i
  if (open.value >= 0) trackClick('open_hobby', { hobby: hobbies.value[i]?.title })
}

// The name, a letter at a time, so each one can turn up on its own.
const first = [...'Clara']
const last = [...'Lívia']

// The photo is a card: it leans toward the pointer, and flips when pressed.
const flipped = ref(false)
const card = ref<HTMLElement | null>(null)
const flip = () => {
  flipped.value = !flipped.value
  if (flipped.value) {
    trackClick('flip_portrait')
    discover('flip', t('secrets.flip'))
  }
}
const lean = (e: PointerEvent) => {
  const el = card.value
  if (!el || e.pointerType !== 'mouse' || flipped.value) return
  const r = el.getBoundingClientRect()
  const x = (e.clientX - r.left) / r.width - 0.5
  const y = (e.clientY - r.top) / r.height - 0.5
  el.style.setProperty('--ry', `${x * 14}deg`)
  el.style.setProperty('--rx', `${-y * 14}deg`)
}
const settle = () => {
  card.value?.style.setProperty('--ry', '0deg')
  card.value?.style.setProperty('--rx', '0deg')
}

// What time is it where Clara is?
const clock = ref('')
let clockTimer = 0
const tick = () => {
  clock.value = new Intl.DateTimeFormat(locale.value === 'en' ? 'en-GB' : 'pt-BR', {
    timeZone: 'America/Fortaleza',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date())
}
onMounted(() => {
  tick()
  clockTimer = window.setInterval(tick, 30000)
})
onBeforeUnmount(() => window.clearInterval(clockTimer))
</script>

<template>
  <section id="about" class="pb-16 pt-20 md:pb-28 md:pt-32">
    <div class="hero">
      <p class="rise eyebrow text-[15px] text-muted">{{ t('about.role') }} · {{ t('about.company') }}</p>

      <h1 class="name font-display font-extrabold text-ink" :aria-label="`${first.join('')} ${last.join('')}`">
        <span class="line" aria-hidden="true">
          <span v-for="(c, i) in first" :key="i" class="ch" :style="{ '--i': i }">{{ c }}</span>
        </span>
        <span class="line" aria-hidden="true">
          <span v-for="(c, i) in last" :key="i" class="ch" :style="{ '--i': i + 5 }">{{ c }}</span><span class="ch dot" :style="{ '--i': 10 }">.</span>
        </span>
      </h1>

      <div class="pic rise" style="--d: 200ms">
        <div class="stage" @pointermove="lean" @pointerleave="settle">
          <button ref="card" type="button" class="card" :class="{ 'is-flipped': flipped }" :aria-label="t('about.flipHint')" :aria-pressed="flipped" @click="flip">
            <span class="face front">
              <img :src="profilePicture" alt="Foto de Clara Lívia" width="512" height="512" fetchpriority="high" />
            </span>
            <span class="face back">
              <span class="back-title">{{ t('about.backTitle') }}</span>
              <span class="back-text">{{ t('about.backText') }}</span>
              <span class="back-hint">{{ t('about.backHint') }}</span>
            </span>
          </button>
        </div>
        <p class="avail text-sm text-muted">
          <span class="inline-flex items-center gap-2">
            <span class="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true"></span>
            {{ t('about.available') }}
          </span>
          <span v-if="clock">{{ t('about.location') }} · {{ clock }}</span>
        </p>
      </div>

      <div class="intro rise" style="--d: 700ms">
        <p class="teaser">{{ t('about.teaser') }}</p>
        <p class="mt-2 max-w-[34ch] text-base text-muted md:text-lg">{{ t('about.intro') }}</p>
      </div>

      <div class="ctas rise flex flex-wrap items-center gap-x-6 gap-y-3" style="--d: 860ms">
        <RouterLink to="/#projects" class="pill-solid" @click="() => trackClick('click_hero_projects')">{{ t('about.cta') }}</RouterLink>
        <RouterLink to="/sobre" class="more" @click="() => trackClick('click_about_page', { section: 'hero' })">
          {{ t('about.curious') }}
          <ArrowRightIcon class="h-4 w-4" aria-hidden="true" />
        </RouterLink>
      </div>

      <div class="chips rise" style="--d: 940ms">
        <p class="text-sm text-muted">{{ t('about.tapHint') }}</p>
        <div class="mt-3 flex flex-wrap gap-2" role="group" :aria-label="t('aboutPage.hobbiesTitle')">
          <button v-for="(h, i) in hobbies" :key="h.title" type="button" class="chip" :aria-pressed="open === i" @click="toggle(i)">
            <HobbyIcon :name="h.icon" class="h-4 w-4" />
            {{ h.title }}
          </button>
        </div>
        <Transition name="story" mode="out-in">
          <p :key="open" class="story mt-4" aria-live="polite">
            <template v-if="open >= 0">
              <strong class="font-semibold text-ink">{{ hobbies[open]?.title }}.</strong> {{ hobbies[open]?.text }}
            </template>
          </p>
        </Transition>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rise {
  animation: rise 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--d, 0ms);
}
@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
}

/* Layout. On a phone it is one column: the name across the whole width, then the small photo
   next to the opening lines. From md up the left column holds the words and the photo sits on the right. */
.hero {
  display: grid;
  grid-template-columns: 6.5rem 1fr;
  column-gap: 1.1rem;
  row-gap: 1.6rem;
  align-items: center;
}
.eyebrow,
.name,
.ctas,
.chips {
  grid-column: 1 / -1;
}
.eyebrow {
  margin-bottom: -0.6rem;
}
.pic {
  display: contents;
}
.avail {
  grid-column: 1 / -1;
  grid-row: 6;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1.1rem;
}
@media (min-width: 768px) {
  .avail {
    flex-direction: column;
    gap: 0.2rem;
  }
}
@media (min-width: 768px) {
  .hero {
    grid-template-columns: 1.5fr 1fr;
    column-gap: 3.5rem;
    row-gap: 0;
    align-items: start;
  }
  .eyebrow,
  .name,
  .ctas,
  .chips,
  .intro {
    grid-column: 1;
  }
  .eyebrow {
    margin-bottom: 1rem;
  }
  .intro {
    margin-top: 1.5rem;
  }
  .ctas {
    margin-top: 2rem;
  }
  .chips {
    margin-top: 3rem;
  }
  .pic {
    display: block;
    grid-column: 2;
    grid-row: 1 / span 5;
    align-self: center;
    width: 100%;
    max-width: 22rem;
    margin-left: auto;
  }
  .avail {
    margin-top: 1rem;
  }
}

/* The name: two big lines. Each letter tips up from below, one after the other. */
.name {
  font-size: 24vw;
  line-height: 0.9;
  letter-spacing: -0.055em;
  perspective: 900px;
}
@media (min-width: 768px) {
  .name {
    font-size: clamp(4rem, 11vw, 8rem);
  }
}
.line {
  display: block;
  white-space: nowrap;
}
.ch {
  display: inline-block;
  transform-origin: 50% 100%;
  animation: tip 1s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--i) * 55ms + 100ms);
}
.ch.dot {
  color: rgb(var(--accent));
}
@keyframes tip {
  from {
    opacity: 0;
    transform: translateY(0.35em) rotateX(-75deg);
  }
}

.teaser {
  font-family: theme('fontFamily.display');
  font-size: clamp(1.25rem, 2.6vw, 1.6rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: rgb(var(--accent));
}

.more {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 15px;
  font-weight: 500;
  color: rgb(var(--ink));
}
.more svg {
  transition: transform 0.25s ease;
}
.more:hover svg {
  transform: translateX(4px);
}

.story {
  min-height: 3.2rem;
  max-width: 44ch;
  color: rgb(var(--muted));
}
.story-enter-active,
.story-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.story-enter-from,
.story-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

/* The photo card. Two faces back to back; the pointer tilts it, a press turns it over. */
.stage {
  width: 100%;
  flex-shrink: 0;
  perspective: 1100px;
}
@media (min-width: 768px) {
  .stage {
    width: 100%;
  }
}
.card {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 4 / 5;
  cursor: pointer;
  transform-style: preserve-3d;
  transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
.card.is-flipped {
  transform: rotateY(180deg);
}
.face {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: 1.25rem;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.front img {
  display: block;
  height: 100%;
  width: 100%;
  object-fit: cover;
  object-position: top;
}
.back {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 0.4rem;
  padding: 0.7rem;
  text-align: left;
  background: rgb(var(--ink));
  color: rgb(var(--surface));
  transform: rotateY(180deg);
}
.back-title {
  font-family: theme('fontFamily.display');
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: rgb(var(--accent));
}
.back-text {
  font-size: 0.7rem;
  line-height: 1.3;
}
.back-hint {
  display: none;
  font-size: 0.8rem;
  opacity: 0.6;
}
@media (min-width: 768px) {
  .back {
    padding: 1.6rem;
    gap: 0.8rem;
  }
  .back-title {
    font-size: 3rem;
  }
  .back-text {
    font-size: 1.1rem;
    line-height: 1.4;
  }
  .back-hint {
    display: block;
  }
}

@media (prefers-reduced-motion: reduce) {
  .rise,
  .ch {
    animation: none;
  }
  .card,
  .story-enter-active,
  .story-leave-active {
    transition: none;
  }
}
</style>
