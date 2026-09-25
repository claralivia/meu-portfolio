<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, ref, type Component } from 'vue'
import { useMouseInElement } from '@vueuse/core'
import { ArrowRightIcon, MapPinIcon, CalendarDaysIcon, ShieldCheckIcon, UserGroupIcon, CodeBracketIcon } from '@heroicons/vue/24/outline'
import IconTile, { type TileColor } from './IconTile.vue'
import GithubIcon from './icons/GithubIcon.vue'
import LinkedinIcon from './icons/LinkedinIcon.vue'
import { useAnalytics } from '../composables/useAnalytics'
import profilePicture from '../assets/minha-foto.webp'

interface Spec {
  icon: string
  value: string
  label: string
}

const specIcons: Record<string, { icon: Component; color: TileColor }> = {
  calendar: { icon: CalendarDaysIcon, color: 'blue' },
  shield: { icon: ShieldCheckIcon, color: 'emerald' },
  mentor: { icon: UserGroupIcon, color: 'pink' },
  code: { icon: CodeBracketIcon, color: 'purple' },
}

const { t, tm } = useI18n()
const { trackClick } = useAnalytics()

const specs = computed((): Spec[] => (tm('about.specs') as Spec[]) || [])

const target = ref<HTMLElement | null>(null)
// Tilt and the Liquid Glass highlight are mouse-only: on touch screens the card
// would otherwise tilt every time someone drags it to scroll.
const canHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches
const { elementX, elementY, isOutside, elementHeight, elementWidth } = useMouseInElement(canHover ? target : null)

const cardStyle = computed(() => {
  if (!canHover || isOutside.value) {
    return {
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
      transition: 'transform 0.5s ease-out',
      '--glow': 0,
    }
  }
  const maxTilt = 5
  const centerX = elementWidth.value / 2
  const centerY = elementHeight.value / 2
  const tiltY = ((elementX.value - centerX) / centerX) * maxTilt
  const tiltX = -((elementY.value - centerY) / centerY) * maxTilt
  return {
    transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
    transition: 'transform 0.05s linear',
    '--mx': `${elementX.value}px`,
    '--my': `${elementY.value}px`,
    '--glow': 1,
  }
})
</script>

<template>
  <section id="about" class="pt-6 pb-12 sm:py-24">
    <div
      ref="target"
      :style="cardStyle"
      class="liquid-glass relative max-w-5xl mx-auto flex flex-col md:flex-row md:items-center gap-6 md:gap-12 p-5 sm:p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-white/50 to-white/20 dark:from-white/10 dark:to-white/5 backdrop-blur-3xl border border-white/50 dark:border-white/20"
    >
      <!-- Desktop: large portrait in its own column -->
      <div class="hidden md:block relative z-10 flex-shrink-0 group animate-float-avatar">
        <div class="squircle w-56 h-56 p-1.5 bg-gradient-to-br from-white/70 to-white/20 dark:from-white/25 dark:to-white/5 shadow-xl shadow-black/10 dark:shadow-black/40 transition-transform duration-500 group-hover:scale-[1.03]">
          <img :src="profilePicture" alt="Foto de Clara Lívia" width="512" height="512" fetchpriority="high" class="squircle w-full h-full object-cover" />
        </div>
        <span class="status-badge bottom-2 right-2 w-7 h-7" :title="t('about.available')">
          <span class="relative flex h-3.5 w-3.5">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60"></span>
            <span class="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-500"></span>
          </span>
          <span class="sr-only">{{ t('about.available') }}</span>
        </span>
      </div>

      <div class="relative z-10 flex-1 min-w-0">
        <!-- Mobile: profile header with the portrait beside the name -->
        <div class="flex items-center gap-4 md:block">
          <div class="md:hidden relative shrink-0">
            <div class="squircle w-20 h-20 p-1 bg-gradient-to-br from-white/80 to-white/30 dark:from-white/25 dark:to-white/5 shadow-lg shadow-black/10">
              <img :src="profilePicture" alt="Foto de Clara Lívia" width="512" height="512" fetchpriority="high" class="squircle w-full h-full object-cover" />
            </div>
            <span class="status-badge -bottom-0.5 -right-0.5 w-6 h-6" :title="t('about.available')">
              <span class="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
              <span class="sr-only">{{ t('about.available') }}</span>
            </span>
          </div>

          <div class="min-w-0">
            <h1 class="hero-title text-[2rem] leading-tight sm:text-5xl lg:text-6xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              Clara Lívia
            </h1>
            <p class="hero-in mt-1 md:mt-3 text-sm sm:text-base text-neutral-600 dark:text-gray-400" style="--d: 120ms">
              {{ t('about.role') }}
              <span class="hidden sm:inline mx-1 text-neutral-400 dark:text-neutral-600" aria-hidden="true">·</span>
              <span class="block sm:inline font-semibold text-neutral-800 dark:text-gray-200">{{ t('about.company') }}</span>
            </p>
            <p class="hero-in mt-1 inline-flex items-center gap-1 text-xs sm:text-sm text-neutral-500 dark:text-gray-400" style="--d: 180ms">
              <MapPinIcon class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {{ t('about.location') }}
            </p>
          </div>
        </div>

        <p class="hero-in mt-5 md:mt-6 text-[15px] sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-xl" style="--d: 260ms">
          {{ t('about.tagline') }}
        </p>

        <dl class="hero-in mt-5 md:mt-8 grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-0 max-w-xl" style="--d: 340ms">
          <div
            v-for="(spec, index) in specs"
            :key="spec.label"
            class="spec flex md:block items-center gap-2.5 p-2.5 md:p-0 md:px-3 rounded-2xl md:rounded-none"
            :class="index > 0 ? 'md:border-l border-neutral-900/10 dark:border-white/10' : 'md:pl-0'"
          >
            <dt class="sr-only">{{ spec.label }}</dt>
            <IconTile
              v-if="specIcons[spec.icon]"
              :icon="specIcons[spec.icon].icon"
              :color="specIcons[spec.icon].color"
              size="sm"
              class="md:mb-2"
            />
            <div class="min-w-0">
              <dd class="text-sm md:text-lg font-bold tracking-tight text-neutral-900 dark:text-white leading-tight whitespace-nowrap">{{ spec.value }}</dd>
              <dd class="text-[11px] md:text-xs text-neutral-500 dark:text-gray-400 leading-tight">{{ spec.label }}</dd>
            </div>
          </div>
        </dl>

        <div class="hero-in mt-6 md:mt-9 flex items-center gap-2.5 sm:gap-3" style="--d: 420ms">
          <RouterLink to="/sobre" class="glass-btn group/more flex-1 md:flex-none" @click="() => trackClick('click_about_page', { section: 'hero' })">
            {{ t('about.more') }}
            <ArrowRightIcon class="w-4 h-4 transition-transform duration-300 group-hover/more:translate-x-0.5" />
          </RouterLink>
          <a
            :href="t('contact.linkedinUrl')"
            target="_blank"
            rel="noopener noreferrer"
            class="glass-btn icon-only"
            :aria-label="t('buttons.linkedin')"
            :title="t('buttons.linkedin')"
            @click="() => trackClick('click_linkedin', { section: 'about' })"
          >
            <LinkedinIcon class="w-5 h-5" />
          </a>
          <a
            :href="t('contact.githubUrl')"
            target="_blank"
            rel="noopener noreferrer"
            class="glass-btn icon-only"
            :aria-label="t('buttons.github')"
            :title="t('buttons.github')"
            @click="() => trackClick('click_github', { section: 'about' })"
          >
            <GithubIcon class="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.glass-btn {
  @apply flex items-center justify-center gap-2 font-medium text-sm sm:text-base py-3 px-4 sm:px-6 rounded-2xl bg-gradient-to-br from-white/50 to-white/20 dark:from-white/10 dark:to-white/5 border border-white/50 dark:border-white/10 backdrop-blur-lg shadow-lg shadow-black/5 dark:shadow-black/20 hover:shadow-xl hover:from-white/60 hover:to-white/30 dark:hover:from-white/20 dark:hover:to-white/10 hover:-translate-y-1 transition-all duration-300 text-neutral-900 dark:text-white;
}

.icon-only {
  @apply !p-0 w-12 h-12 sm:w-[3.25rem] sm:h-[3.25rem] shrink-0 rounded-full;
}

.status-badge {
  @apply absolute flex items-center justify-center rounded-full bg-white/90 dark:bg-neutral-900/90 shadow-md;
}

/* On phones each highlight is its own small glass cell; from md up they sit in
   a row separated by dividers. */
.spec {
  @apply bg-white/40 dark:bg-white/5 ring-1 ring-inset ring-white/50 dark:ring-white/10 md:bg-transparent md:ring-0 md:dark:bg-transparent;
}

/* iOS app-icon shape: continuous corners approximated with a large radius. */
.squircle {
  border-radius: 28%;
}

/* Liquid Glass: a rim of light and a soft sheen that follow the cursor, plus a
   fixed top edge highlight like real glass catching light. */
.liquid-glass {
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.6),
    inset 0 -1px 0 rgba(255, 255, 255, 0.1),
    0 25px 50px -12px rgba(0, 0, 0, 0.1);
}
:global(.dark .liquid-glass) {
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.18),
    inset 0 -1px 0 rgba(255, 255, 255, 0.04),
    0 25px 50px -12px rgba(0, 0, 0, 0.5);
}
.liquid-glass::before,
.liquid-glass::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.5s ease;
}
.liquid-glass::before {
  padding: 1.5px;
  background: radial-gradient(260px circle at var(--mx, 50%) var(--my, 0%), rgba(255, 255, 255, 0.95), transparent 70%);
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  mask-composite: exclude;
}
.liquid-glass::after {
  background: radial-gradient(520px circle at var(--mx, 50%) var(--my, 0%), rgba(255, 255, 255, 0.22), transparent 45%);
}
:global(.dark .liquid-glass::after) {
  background: radial-gradient(520px circle at var(--mx, 50%) var(--my, 0%), rgba(255, 255, 255, 0.07), transparent 45%);
}
@media (hover: hover) {
  .liquid-glass::before,
  .liquid-glass::after {
    opacity: var(--glow, 0);
  }
}

@keyframes float-avatar {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
}
.animate-float-avatar {
  animation: float-avatar 6s ease-in-out infinite;
}

/* Apple-style entrance: fade in while the blur resolves. */
.hero-title {
  animation: hero-in 1.1s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.hero-in {
  animation: hero-in 1s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--d, 0ms);
}
@keyframes hero-in {
  from {
    opacity: 0;
    filter: blur(10px);
    transform: translateY(8px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .hero-title,
  .hero-in,
  .animate-float-avatar {
    animation: none;
  }
}
</style>
