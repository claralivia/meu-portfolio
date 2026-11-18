<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useShowcase } from '../composables/useShowcase'

/**
 * The wave that carries projects in and out. It rises from the sea at the bottom
 * of the screen, passes over the whole project area (text and frame), and
 * falls back. position.swell (0..1) is how high it stands; StageFrame sets it.
 */
const { position } = useShowcase()

const root = ref<SVGElement | null>(null)
const back = ref<SVGPathElement | null>(null)
const front = ref<SVGPathElement | null>(null)
const foam = ref<SVGPathElement | null>(null)
const glow = ref<SVGPathElement | null>(null)

let raf = 0
onMounted(() => {
  const surfacePath = (level: number, phase: number, lift: number, amp: number, freq: number) => {
    const surface = 110 - level * 98 - lift // % from the top; below the screen at 110, near the top at ~12
    let d = ''
    for (let x = -4; x <= 104; x += 2) {
      const u = x / 100
      const y = surface + amp * Math.sin(u * Math.PI * freq + phase) + amp * 0.4 * Math.sin(u * Math.PI * (freq * 2.3) - phase * 1.4)
      d += `${d ? 'L' : 'M'}${x} ${y.toFixed(2)} `
    }
    return d
  }

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick)
    const level = position.swell
    const el = root.value
    if (!el) return
    if (level < 0.004) {
      if (el.style.opacity !== '0') el.style.opacity = '0'
      return
    }
    el.style.opacity = '1'
    const phase = position.q * 7 + now / 700
    const amp = 2.6 + level * 3
    const line = surfacePath(level, phase, 0, amp, 2.1)
    const behind = surfacePath(level, phase + 1.9, 5.5, amp * 1.1, 1.7)
    front.value?.setAttribute('d', `${line}L104 120 L-4 120 Z`)
    back.value?.setAttribute('d', `${behind}L104 120 L-4 120 Z`)
    foam.value?.setAttribute('d', line)
    glow.value?.setAttribute('d', line)
  }
  raf = requestAnimationFrame(tick)
})
onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<template>
  <svg
    ref="root"
    class="tide"
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
    aria-hidden="true"
    style="opacity: 0"
  >
    <defs>
      <linearGradient id="tide-front" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" style="stop-color: var(--tide-top)" stop-opacity="0.9" />
        <stop offset="1" style="stop-color: var(--tide-bottom)" stop-opacity="0.97" />
      </linearGradient>
    </defs>
    <path ref="back" fill="var(--tide-back)" />
    <path ref="front" fill="url(#tide-front)" />
    <path ref="glow" fill="none" stroke="rgb(255 255 255 / 0.3)" stroke-width="16" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
    <path ref="foam" fill="none" stroke="rgb(255 255 255 / 0.95)" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" />
  </svg>
</template>

<style scoped>
.tide {
  --tide-top: #46c3df;
  --tide-bottom: #0c6f98;
  --tide-back: rgb(127 214 232 / 0.55);
  position: fixed;
  inset: 0;
  z-index: 20; /* over the page content and the frame, under the navigation */
  width: 100%;
  height: 100%;
  pointer-events: none;
}
:global(.dark) .tide {
  --tide-top: #1b8fb0;
  --tide-bottom: #06405f;
  --tide-back: rgb(40 150 180 / 0.5);
}
</style>
