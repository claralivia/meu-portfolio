<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import GithubIcon from './icons/GithubIcon.vue'
import LinkedinIcon from './icons/LinkedinIcon.vue'
import HobbyIcon from './icons/HobbyIcon.vue'
import { ArrowRightIcon } from '@heroicons/vue/24/outline'
import { useAnalytics } from '../composables/useAnalytics'
import { useShowcase } from '../composables/useShowcase'
import profilePicture from '../assets/minha-foto.webp'

interface Sticker {
  icon: string
  label: string
}

const { t, tm, locale } = useI18n()
const contact = computed(() => tm('contact') as { linkedinUrl: string; githubUrl: string })
const stickers = computed(() => (tm('about.stickers') as Sticker[]) || [])
const { trackClick } = useAnalytics()
const { isStage } = useShowcase()

// Around the portrait on wide screens; a plain row of chips on phones.
const PLACES = [
  { right: '17rem', top: '17%', rot: '-6deg' },
  { right: '0.25rem', top: '9%', rot: '5deg' },
  { right: '18.5rem', top: '63%', rot: '4deg' },
  { right: '8rem', top: '83%', rot: '-4deg' },
  { right: '20.5rem', top: '41%', rot: '-3deg' },
]
const place = (i: number) => PLACES[i % PLACES.length]

// What time is it where Clara is? Small thing, but it is hers.
const clock = ref('')
let timer = 0
const tick = () => {
  clock.value = new Intl.DateTimeFormat(locale.value === 'en' ? 'en-GB' : 'pt-BR', {
    timeZone: 'America/Fortaleza',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date())
}
// The stickers drift a little against the pointer, each at its own depth.
const hero = ref<HTMLElement | null>(null)
let pointerFrame = 0
const onPointer = (e: PointerEvent) => {
  if (e.pointerType !== 'mouse' || pointerFrame || !hero.value) return
  pointerFrame = requestAnimationFrame(() => {
    pointerFrame = 0
    const x = (e.clientX / window.innerWidth - 0.5) * 2
    const y = (e.clientY / window.innerHeight - 0.5) * 2
    hero.value?.style.setProperty('--mx', x.toFixed(3))
    hero.value?.style.setProperty('--my', y.toFixed(3))
  })
}

onMounted(() => {
  tick()
  timer = window.setInterval(tick, 20000)
  window.addEventListener('pointermove', onPointer, { passive: true })
})
onBeforeUnmount(() => {
  window.clearInterval(timer)
  window.removeEventListener('pointermove', onPointer)
  cancelAnimationFrame(pointerFrame)
})
</script>

<template>
  <section id="about" class="hero flex min-h-[100svh] items-center pb-16 pt-28 sm:pb-24">
    <div ref="hero" class="hero-content relative grid w-full items-center gap-8 md:grid-cols-[1fr_auto] md:gap-16">
      <!-- The StageFrame (App level) starts here, as the portrait. -->
      <div
        id="hero-slot"
        class="h-28 w-28 sm:h-36 sm:w-36 md:order-2 md:h-72 md:w-72"
        :class="isStage ? '' : 'glass rounded-[1.75rem] p-1.5'"
        aria-hidden="true"
      >
        <img
          v-if="!isStage"
          :src="profilePicture"
          alt=""
          width="512"
          height="512"
          fetchpriority="high"
          class="h-full w-full rounded-[1.3rem] object-cover"
        />
      </div>

      <div class="min-w-0 max-w-2xl md:order-1">
        <h1
          class="hero-in font-display text-[clamp(3.1rem,10.4vw,6.7rem)] font-extrabold leading-[0.96] text-ink"
          style="letter-spacing: -0.04em; text-wrap: balance"
        >
          {{ t('about.greeting') }}
          <span class="name relative inline-block">
            {{ t('about.greetingName') }}
            <svg class="squiggle" viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true">
              <path d="M2 7 Q 14 -1 26 7 T 50 7 T 74 7 T 98 7" pathLength="1" />
            </svg>
          </span>
        </h1>

        <p class="hero-in mt-6 text-lg text-ink sm:text-xl" style="--d: 100ms">
          {{ t('about.role') }}<span class="text-muted"> · {{ t('about.company') }}</span>
        </p>

        <p class="hero-in mt-4 max-w-[40ch] text-[17px] leading-relaxed text-muted sm:text-lg" style="--d: 180ms">
          {{ t('about.tagline') }}
        </p>

        <div class="hero-in mt-9 flex flex-wrap items-center gap-3" style="--d: 260ms">
          <RouterLink to="/#projects" class="pill-solid" @click="() => trackClick('click_hero_projects')">
            {{ t('about.cta') }}
          </RouterLink>
          <RouterLink to="/#contact" class="pill-glass" @click="() => trackClick('click_hero_contact')">
            {{ t('navbar.contact') }}
          </RouterLink>
          <span class="mx-1 hidden h-5 w-px bg-ink/15 sm:block" aria-hidden="true"></span>
          <a
            :href="contact.githubUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="social"
            :aria-label="t('buttons.github')"
            @click="() => trackClick('click_github', { section: 'hero' })"
          >
            <GithubIcon class="h-5 w-5" />
          </a>
          <a
            :href="contact.linkedinUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="social"
            :aria-label="t('buttons.linkedin')"
            @click="() => trackClick('click_linkedin', { section: 'hero' })"
          >
            <LinkedinIcon class="h-5 w-5" />
          </a>
        </div>

        <RouterLink
          to="/sobre"
          class="more hero-in group mt-6 inline-flex items-center gap-2 text-[15px] font-medium text-ink"
          style="--d: 300ms"
          @click="() => trackClick('click_about_page', { section: 'hero' })"
        >
          <span class="more-text">{{ t('about.curious') }}</span>
          <ArrowRightIcon class="more-arrow h-4 w-4 text-sun" aria-hidden="true" />
        </RouterLink>

        <ul class="stickers mt-8" :aria-label="t('aboutPage.hobbiesTitle')">
          <li
            v-for="(s, i) in stickers"
            :key="s.label"
            class="sticker"
            :style="{ '--d': `${340 + i * 80}ms`, '--right': place(i).right, '--top': place(i).top, '--rot': place(i).rot, '--float': `${i * 0.7}s`, '--depth': `${10 + i * 5}px`, '--dir': i % 2 ? 1 : -1 }"
          >
            <HobbyIcon :name="s.icon" class="h-[18px] w-[18px] shrink-0 text-accent" />
            {{ s.label }}
          </li>
        </ul>

        <p class="hero-in mt-8 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted" style="--d: 520ms">
          <span class="inline-flex items-center gap-2">
            <span class="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true"></span>
            {{ t('about.available') }}
          </span>
          <span v-if="clock" class="inline-flex items-center gap-2 tabular-nums">
            <HobbyIcon name="beach" class="h-4 w-4" />
            {{ t('about.nowIn') }}: {{ clock }}
          </span>
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.social {
  @apply flex h-10 w-10 items-center justify-center rounded-full text-muted transition duration-300 hover:text-ink;
}
.social:hover {
  background: rgb(var(--ink) / 0.07);
}

/* A hand-drawn wave under the name, drawn in as the page loads. */
.squiggle {
  position: absolute;
  left: 0.02em;
  bottom: -0.04em;
  width: 96%;
  height: 0.2em;
  overflow: visible;
}
.squiggle path {
  fill: none;
  stroke: rgb(var(--sun));
  stroke-width: 3.2;
  stroke-linecap: round;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: draw 1.1s 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}

/* Stickers: glass chips with a drawn icon. A row on phones, loose around the portrait from md. */
.stickers {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.sticker {
  --chip: #ffffff;
  position: relative;
  isolation: isolate;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 1.1rem 0.55rem 0.85rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #14284a;
}
:global(.dark) .sticker {
  --chip: #e9f0fc;
}
.sticker svg {
  color: #0b6e8a;
}
/* A little cloud behind the label: a soft body shaded underneath and lit on top,
   its edge roughened by the noise filters defined in App.vue. */
.sticker::before {
  content: '';
  position: absolute;
  inset: -4px -8px -5px;
  z-index: -1;
  border-radius: 9999px;
  background: var(--chip);
  box-shadow:
    inset 0 -8px 10px -4px rgb(120 150 200 / 0.4),
    inset 0 4px 6px rgb(255 255 255 / 0.9);
  filter: url(#cc-a) drop-shadow(0 9px 8px rgb(30 60 100 / 0.18));
}
.sticker::after {
  content: '';
  position: absolute;
  inset: -7px -4px 9px;
  z-index: -1;
  border-radius: 9999px;
  background: rgb(255 255 255 / 0.6);
  filter: url(#cc-b);
}
.sticker svg {
  animation: wiggle 4.2s ease-in-out infinite;
  animation-delay: var(--float, 0s);
  transform-origin: 50% 70%;
}
@keyframes wiggle {
  0%,
  62%,
  100% {
    transform: none;
  }
  70% {
    transform: rotate(-16deg) scale(1.12);
  }
  78% {
    transform: rotate(13deg) scale(1.12);
  }
  86% {
    transform: rotate(-7deg);
  }
  93% {
    transform: rotate(3deg);
  }
}
/* On phones the chips just breathe, one after another. */
@media (max-width: 767px) {
  .sticker {
    animation:
      hero-in-m 0.9s cubic-bezier(0.22, 1, 0.36, 1) both,
      bob 4.8s ease-in-out infinite;
    animation-delay: var(--d, 0ms), var(--float, 0s);
  }
  @keyframes bob {
    50% {
      translate: 0 -4px;
    }
  }
}
@media (min-width: 768px) {
  .sticker {
    position: absolute;
    right: var(--right);
    top: var(--top);
    transform: translate(calc(var(--mx, 0) * var(--depth, 12px) * var(--dir, 1)), calc(var(--my, 0) * var(--depth, 12px))) rotate(var(--rot));
    transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    animation:
      pop 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) both,
      bob 5.5s ease-in-out infinite;
    animation-delay: var(--d, 0ms), var(--float, 0s);
    font-size: 0.875rem;
    cursor: default;
  }
  .sticker:hover {
    transform: translate(calc(var(--mx, 0) * var(--depth, 12px) * var(--dir, 1)), calc(var(--my, 0) * var(--depth, 12px))) rotate(0deg) scale(1.12);
  }
  @keyframes pop {
    from {
      opacity: 0;
      scale: 0.5;
    }
  }
  @keyframes bob {
    50% {
      translate: 0 -9px;
    }
  }
}

/* "Want to know more?": a line that draws in under the text, and an arrow that nudges. */
.more-text {
  background: linear-gradient(rgb(var(--sun)), rgb(var(--sun))) 0 100% / 0% 2px no-repeat;
  padding-bottom: 3px;
  transition: background-size 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.more:hover .more-text,
.more:focus-visible .more-text {
  background-size: 100% 2px;
}
.more-arrow {
  animation: nudge 2.4s ease-in-out infinite;
}
.more:hover .more-arrow {
  animation-duration: 0.9s;
}
@keyframes nudge {
  50% {
    translate: 5px 0;
  }
}

/* One authored entrance: fade in while the blur resolves, staggered. */
.hero-in {
  animation: hero-in 1s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--d, 0ms);
}
@keyframes hero-in {
  from {
    opacity: 0;
    filter: blur(10px);
    transform: translateY(14px);
  }
}

/* On the way out the hero recedes, so the projects feel like the next layer. */
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .hero-content {
      animation: hero-out linear both;
      animation-timeline: view();
      animation-range: exit 10% exit 90%;
    }
    @keyframes hero-out {
      to {
        opacity: 0;
        transform: translateY(-40px) scale(0.97);
      }
    }
  }
}

@media (max-width: 767px) {
  .hero-in {
    animation-name: hero-in-m;
    animation-duration: 0.9s;
  }
  @keyframes hero-in-m {
    from {
      opacity: 0;
      transform: translateY(18px);
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-in,
  .sticker,
  .sticker svg,
  .more-arrow {
    animation: none;
  }
  .squiggle path {
    animation: none;
    stroke-dashoffset: 0;
  }
}
</style>
