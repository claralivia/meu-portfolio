<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowUpRightIcon } from '@heroicons/vue/24/outline'
import { useAnalytics } from '../composables/useAnalytics'
import { useProjects, type Project } from '../composables/useProjects'
import { useShowcase } from '../composables/useShowcase'

// Screens of scrolling each project gets while the desktop showcase is pinned.
const SCROLL_PER_PROJECT = 80
const MAX_STACK = 6
const MAX_CARD_STACK = 5

const { t } = useI18n()
const { trackClick } = useAnalytics()
const { projects } = useProjects()
const { activeIndex, isStage, position } = useShowcase()

const demoImages = import.meta.glob<string>('../assets/*.webp', { eager: true, import: 'default' })
const imageFor = (key: string) => demoImages[`../assets/${key}.webp`]

const section = ref<HTMLElement | null>(null)
const height = computed(() => `${projects.value.length * SCROLL_PER_PROJECT + 100}svh`)

// The technologies a project shares with the previous one lead the list and are
// highlighted: they are the words that connect the two projects.
const sharedFor = (index: number) => {
  if (index === 0) return new Set<string>()
  const before = new Set(projects.value[index - 1]?.tags ?? [])
  return new Set((projects.value[index]?.tags ?? []).filter((tag) => before.has(tag)))
}
const orderedStack = (index: number, max: number) => {
  const tags = projects.value[index]?.tags ?? []
  const shared = sharedFor(index)
  return [...tags.filter((tag) => shared.has(tag)), ...tags.filter((tag) => !shared.has(tag))].slice(0, max)
}

const codeLinks = (project: Project) => {
  if (project.githubUrls) return project.githubUrls
  return project.githubUrl ? [{ label: t('caseStudy.code'), url: project.githubUrl }] : []
}

// ---- Desktop: the pinned showcase follows how far the section has scrolled. The
// position q is continuous (2.4 = 40% of the way from project 3 to project 4) and
// eased, so nothing ever jumps: text and screenshots travel with the scroll.
const HOLD = 0.4 // share of each project's scroll spent still, before the tide moves
let target = 0
let loop = 0
let reduced = false
const ease = (t: number) => t * t * (3 - 2 * t)

const step = () => {
  loop = 0
  position.q += (target - position.q) * (reduced ? 1 : 0.14)
  if (Math.abs(target - position.q) < 0.0008) position.q = target
  section.value?.style.setProperty('--q', position.q.toFixed(4))
  const focus = Math.round(position.q)
  if (focus !== activeIndex.value) activeIndex.value = focus
  if (position.q !== target) loop = requestAnimationFrame(step)
}
const kick = () => {
  if (!loop) loop = requestAnimationFrame(step)
}
const update = () => {
  const el = section.value
  if (!el || !isStage.value) return
  const rect = el.getBoundingClientRect()
  const range = rect.height - window.innerHeight
  const progress = range > 0 ? Math.min(Math.max(-rect.top / range, 0), 0.9999) : 0
  const n = projects.value.length
  const s = progress * n
  const i = Math.min(Math.floor(s), n - 1)
  const u = s - i
  target = i >= n - 1 ? n - 1 : i + (u < HOLD ? 0 : ease((u - HOLD) / (1 - HOLD)))
  kick()
}

// ---- Phones: a native swipe carousel. The browser does the scrolling, so it
// stays smooth; script only reads the position to light the right card/dot.
const track = ref<HTMLElement | null>(null)
const mobileIndex = ref(0)
const touched = ref(false)
let frame = 0

const readTrack = () => {
  frame = 0
  const el = track.value
  if (!el || el.children.length < 2) return
  const first = el.children[0] as HTMLElement
  const second = el.children[1] as HTMLElement
  const step = second.offsetLeft - first.offsetLeft
  mobileIndex.value = Math.min(Math.max(Math.round(el.scrollLeft / step), 0), projects.value.length - 1)
}
const onTrackScroll = () => {
  touched.value = true
  if (!frame) frame = requestAnimationFrame(readTrack)
}
const goTo = (index: number) => {
  const el = track.value
  const slide = el?.children[index] as HTMLElement | undefined
  if (!el || !slide) return
  el.scrollTo({ left: slide.offsetLeft - (el.clientWidth - slide.clientWidth) / 2, behavior: 'smooth' })
}

onMounted(() => {
  reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', update)
  update()
})
onUnmounted(() => {
  window.removeEventListener('scroll', update)
  window.removeEventListener('resize', update)
  cancelAnimationFrame(frame)
  cancelAnimationFrame(loop)
  position.q = 0
  activeIndex.value = 0
})
watch([projects, isStage], update)
</script>

<template>
  <!-- DESKTOP: pinned showcase. The StageFrame (App level) is drawn over #showcase-slot. -->
  <section v-if="isStage" id="projects" ref="section" class="relative" :style="{ height }" :aria-label="t('projects.title')">
    <div class="sticky top-0 grid h-[100svh] grid-cols-[1fr_1.2fr] items-center gap-14 pt-20 pb-6">
      <div id="showcase-slot" class="order-2 aspect-[16/10] w-full max-h-[68svh]" aria-hidden="true"></div>

      <div class="order-1 min-w-0">
        <h2 class="mb-8 text-sm font-medium text-muted">{{ t('projects.title') }}</h2>

        <!-- Every project's text shares one cell and drifts with the scroll: the one
             leaving slides off to the left while the next comes in from the right. -->
        <div class="grid">
          <article
            v-for="(project, index) in projects"
            :key="project.slug"
            class="caption"
            :class="{ 'is-focus': index === activeIndex }"
            :style="{ '--j': index }"
            :aria-hidden="index === activeIndex ? undefined : 'true'"
          >
            <h3 class="font-display text-[clamp(2.25rem,6vw,4.5rem)] font-semibold leading-none text-ink" style="letter-spacing: -0.04em">
              {{ project.title }}
            </h3>
            <p class="mt-4 max-w-[36ch] text-lg leading-relaxed text-muted">{{ project.tagline || project.description }}</p>

            <ul class="words mt-5" :aria-label="t('caseStudy.stack')">
              <li v-for="word in orderedStack(index, MAX_STACK)" :key="word" :class="sharedFor(index).has(word) ? 'text-accent' : 'text-ink/65'">
                {{ word }}
              </li>
            </ul>

            <div class="mt-8 flex flex-wrap items-center gap-2.5">
              <RouterLink
                :to="`/projetos/${project.slug}`"
                class="pill-solid"
                :tabindex="index === activeIndex ? 0 : -1"
                @click="() => trackClick('click_case_study', { project_title: project.title })"
              >
                {{ t('projects.caseStudy') }}
              </RouterLink>
              <a
                v-if="project.liveUrl"
                :href="project.liveUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="pill-glass"
                :tabindex="index === activeIndex ? 0 : -1"
                @click="() => trackClick('click_project_live', { project_title: project.title })"
              >
                {{ t('buttons.live') }}
                <ArrowUpRightIcon class="h-3.5 w-3.5" />
              </a>
              <a
                v-for="link in codeLinks(project)"
                :key="link.url"
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
                class="px-2 py-2 text-sm font-medium text-muted transition-colors hover:text-ink"
                :tabindex="index === activeIndex ? 0 : -1"
                @click="() => trackClick('click_project_github', { project_title: project.title, link_label: link.label })"
              >
                {{ link.label }}
              </a>
            </div>
          </article>
        </div>

        <div class="mt-10 flex items-center gap-1.5" aria-hidden="true">
          <span
            v-for="(project, index) in projects"
            :key="project.slug"
            class="h-1 rounded-full bg-sun transition-all duration-500 ease-out"
            :class="index === activeIndex ? 'w-8 opacity-90' : 'w-2 opacity-25'"
          ></span>
        </div>
      </div>
    </div>
  </section>

  <!-- PHONES: a swipe carousel. Native scrolling and snapping, depth from CSS only. -->
  <section v-else id="projects" ref="section" class="m-recede relative pb-14 pt-24" :aria-label="t('projects.title')">
    <div class="mb-6 flex items-end justify-between gap-4">
      <h2 class="section-title">{{ t('projects.title') }}</h2>
      <p class="pb-1 text-sm tabular-nums text-muted" aria-hidden="true">
        {{ String(mobileIndex + 1).padStart(2, '0') }}<span class="opacity-50"> / {{ String(projects.length).padStart(2, '0') }}</span>
      </p>
    </div>

    <ul ref="track" class="track -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-10 pt-6" @scroll.passive="onTrackScroll">
      <li
        v-for="(project, index) in projects"
        :key="project.slug"
        class="slide w-[80%] shrink-0 snap-center"
        :class="{ 'is-active': index === mobileIndex }"
      >
        <article class="cloud-card flex h-full flex-col p-3">
          <div class="frame relative aspect-[16/10] overflow-hidden rounded-lg bg-ink/5">
            <img
              :src="imageFor(project.key)"
              :alt="`Demo do projeto ${project.title}`"
              width="960"
              height="540"
              :loading="index < 2 ? 'eager' : 'lazy'"
              decoding="async"
              class="card-img absolute inset-0 h-full w-full object-cover object-top"
              draggable="false"
            />
          </div>

          <div class="flex flex-1 flex-col p-3 pt-4">
            <h3 class="font-display text-[1.75rem] font-semibold leading-tight text-ink" style="letter-spacing: -0.03em">{{ project.title }}</h3>
            <p class="mt-1.5 text-[15px] leading-relaxed text-muted">{{ project.tagline || project.description }}</p>

            <ul class="words-m mt-4" :aria-label="t('caseStudy.stack')">
              <li
                v-for="(word, i) in orderedStack(index, MAX_CARD_STACK)"
                :key="word"
                :class="sharedFor(index).has(word) ? 'text-accent' : 'text-ink/65'"
                :style="{ '--i': i }"
              >
                {{ word }}
              </li>
            </ul>

            <div class="mt-auto flex flex-wrap items-center gap-2 pt-5">
              <RouterLink
                :to="`/projetos/${project.slug}`"
                class="pill-solid !px-4"
                @click="() => trackClick('click_case_study', { project_title: project.title })"
              >
                {{ t('projects.caseStudyShort') }}
              </RouterLink>
              <a
                v-if="project.liveUrl"
                :href="project.liveUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="pill-glass !px-4"
                @click="() => trackClick('click_project_live', { project_title: project.title })"
              >
                {{ t('buttons.live') }}
                <ArrowUpRightIcon class="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </article>
      </li>
    </ul>

    <div class="flex items-center justify-center gap-2" role="tablist" :aria-label="t('projects.title')">
      <button
        v-for="(project, index) in projects"
        :key="project.slug"
        role="tab"
        :aria-selected="index === mobileIndex"
        :aria-label="project.title"
        class="dot h-1.5 rounded-full bg-sun transition-all duration-500 ease-out"
        :class="index === mobileIndex ? 'w-7 opacity-90' : 'w-1.5 opacity-30'"
        @click="goTo(index)"
      ></button>
    </div>
    <p class="swipe-hint mt-4 text-center text-xs text-muted" :class="{ 'is-gone': touched }" aria-hidden="true">{{ t('projects.swipe') }} →</p>
  </section>
</template>

<style scoped>
/* ----- Desktop captions: they travel with the scroll. -----
   --q is the continuous project position, --j this caption's own index. Distance d
   from the centre moves it sideways and fades it out, so the leaving text slips
   away to the left as the arriving text drifts in from the right. */
.caption {
  grid-area: 1 / 1;
  --d: calc(var(--j) - var(--q, 0));
  transform: translate3d(calc(var(--d) * 200px), 0, 0);
  /* Zero by 0.29 either side: the text leaving and the text arriving never overlap. */
  opacity: max(0, calc(1 - var(--d) * var(--d) * 12));
  pointer-events: none;
  will-change: transform, opacity;
}
.caption.is-focus {
  pointer-events: auto;
}
.words {
  display: flex;
  flex-wrap: wrap;
  gap: 0.15rem 0.9rem;
  font-size: 0.9375rem;
  font-weight: 500;
}

/* ----- Phone carousel ----- */
.track {
  scrollbar-width: none;
  overscroll-behavior-x: contain;
  scroll-padding-inline: 1.25rem;
  -webkit-overflow-scrolling: touch;
}
.track::-webkit-scrollbar {
  display: none;
}
.slide {
  /* Cards the user is not on sit slightly back; the active one comes forward. */
  transition:
    opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  opacity: 0.55;
  transform: scale(0.94);
}
.slide.is-active {
  opacity: 1;
  transform: none;
}
.dot {
  /* tap target bigger than the visible dot */
  position: relative;
}
.dot::after {
  content: '';
  position: absolute;
  inset: -12px -4px;
}

/* The technology words rise in one after another when a card becomes active. */
.words-m {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.85rem;
  font-size: 0.875rem;
  font-weight: 500;
}
.words-m li {
  opacity: 0.5;
  transform: translateY(6px);
  transition:
    opacity 0.5s ease,
    transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(var(--i) * 60ms);
}
.slide.is-active .words-m li {
  opacity: 1;
  transform: none;
}

.swipe-hint {
  transition: opacity 0.6s ease;
}
.swipe-hint.is-gone {
  opacity: 0;
}

/* With scroll-driven animations the depth follows the finger frame by frame,
   on the compositor; the class-based version above is the fallback. */
@supports (animation-timeline: view(inline)) {
  @media (prefers-reduced-motion: no-preference) {
    .slide {
      transition: none;
      opacity: 1;
      transform: none;
      animation: slide-depth linear both;
      animation-timeline: view(inline);
    }
    .card-img {
      transform: scale(1.18);
      animation: card-pan linear both;
      animation-timeline: view(inline);
    }
    @keyframes slide-depth {
      0%,
      100% {
        opacity: 0.45;
        transform: scale(0.9) translateY(12px);
      }
      50% {
        opacity: 1;
        transform: none;
      }
    }
    @keyframes card-pan {
      from {
        transform: translateX(-7%) scale(1.18);
      }
      to {
        transform: translateX(7%) scale(1.18);
      }
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .words-m li,
  .slide {
    transition: none;
  }
}
</style>
