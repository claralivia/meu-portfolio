<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAnalytics } from '../composables/useAnalytics'
import { useShowcase } from '../composables/useShowcase'

/**
 * Back to top, as a cup of coffee that fills as you read down the page. Full cup
 * at the bottom, with a little more steam; pressing it takes you back up, and the
 * cup empties on the way.
 */
const { t } = useI18n()
const { trackClick } = useAnalytics()
const { isNight } = useShowcase()

const button = ref<HTMLElement | null>(null)
const shown = ref(false)
const full = ref(false)
const percent = ref(0)
let frame = 0

const update = () => {
  frame = 0
  const max = document.documentElement.scrollHeight - window.innerHeight
  const p = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0
  button.value?.style.setProperty('--p', p.toFixed(4))
  const next = window.scrollY > 260
  if (next !== shown.value) shown.value = next
  const isFull = p > 0.97
  if (isFull !== full.value) full.value = isFull
  percent.value = Math.round(p * 100)
}
const schedule = () => {
  if (!frame) frame = requestAnimationFrame(update)
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  trackClick('click_back_to_top')
}

onMounted(() => {
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule)
  update()
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', schedule)
  window.removeEventListener('resize', schedule)
  cancelAnimationFrame(frame)
})
</script>

<template>
  <transition name="cup">
    <button
      v-show="shown"
      ref="button"
      type="button"
      class="cup glass fixed bottom-5 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full text-ink sm:bottom-8 sm:right-8"
      :class="{ night: isNight, 'is-full': full }"
      :aria-label="t('buttons.backToTop')"
      :title="`${percent}% · ${t('buttons.backToTop')}`"
      @click="scrollToTop"
    >
      <svg viewBox="0 0 48 48" class="h-9 w-9 overflow-visible" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id="cup-inside">
            <path d="M11 20h22v9a9 9 0 0 1-9 9h-4a9 9 0 0 1-9-9z" />
          </clipPath>
        </defs>

        <!-- Steam: a little while it fills, more once the cup is full. -->
        <g class="steam" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
          <path class="s1" d="M17 15c-2-1.8 2-3.2 0-5.2" />
          <path class="s2" d="M22 15c-2-1.8 2-3.2 0-5.2" />
          <path class="s3" d="M27 15c-2-1.8 2-3.2 0-5.2" />
        </g>

        <!-- The coffee: its surface rises with --p and ripples sideways. -->
        <g clip-path="url(#cup-inside)">
          <g class="coffee">
            <g class="ripple">
              <path d="M-24 0q6-2.6 12 0t12 0 12 0 12 0 12 0 12 0 12 0V40H-24z" fill="#7a4a2e" />
              <path d="M-24 0q6-2.6 12 0t12 0 12 0 12 0 12 0 12 0 12 0" fill="none" stroke="#e3b27a" stroke-width="1.5" stroke-linecap="round" />
            </g>
          </g>
        </g>

        <path d="M11 20h22v9a9 9 0 0 1-9 9h-4a9 9 0 0 1-9-9z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
        <path d="M33 22.5h2.2a3.8 3.8 0 0 1 0 7.6H33" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        <ellipse cx="22" cy="41.5" rx="13" ry="2" fill="currentColor" opacity="0.22" />
      </svg>
    </button>
  </transition>
</template>

<style scoped>
.cup {
  --p: 0;
  transition:
    transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.4s ease;
}
.cup:hover {
  transform: translateY(-3px) scale(1.06);
}
.cup:active {
  transform: scale(0.94);
}

/* Surface at y=40 (empty, below the cup) up to y=21 (full). */
.coffee {
  transform: translateY(calc(40px - var(--p) * 19px));
}
.ripple {
  animation: ripple 2.2s linear infinite;
}
@keyframes ripple {
  to {
    transform: translateX(24px);
  }
}

.steam path {
  opacity: 0;
  stroke-dasharray: 12;
  animation: steam 3.2s ease-in-out infinite;
}
.steam .s2 {
  animation-delay: 0.7s;
}
.steam .s3 {
  animation-delay: 1.4s;
}
.cup:hover .steam path,
.cup.is-full .steam path {
  opacity: 0.75;
}
@keyframes steam {
  0% {
    stroke-dashoffset: 12;
    transform: translateY(2px);
  }
  50% {
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dashoffset: -12;
    transform: translateY(-3px);
    opacity: 0;
  }
}
.cup.is-full {
  box-shadow:
    inset 0 0 0 1px var(--glass-rim),
    0 0 0 6px rgb(var(--sun) / 0.18),
    0 18px 36px -22px var(--glass-drop);
}

.cup-enter-active,
.cup-leave-active {
  transition:
    opacity 0.4s ease,
    transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.cup-enter-from,
.cup-leave-to {
  opacity: 0;
  transform: translateY(14px) scale(0.6);
}

@media (prefers-reduced-motion: reduce) {
  .ripple,
  .steam path {
    animation: none;
  }
  .steam path {
    opacity: 0.6;
    stroke-dashoffset: 0;
  }
}
</style>
