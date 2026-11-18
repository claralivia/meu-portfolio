<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useTheme } from '../composables/useTheme'
import { useShowcase } from '../composables/useShowcase'

/**
 * The whole page is one day in Fortaleza. A fixed sky sits behind everything and
 * moves through four moments as you scroll: dawn (hero), midday (projects),
 * sunset (experience) and night (contact). The sun crosses the sky, the moon
 * and stars come out, and the sea at the bottom rises. Nothing here is aligned
 * with the content, so it is driven from script without any visible lag.
 *
 * On every route but the home page the sky just stays at midday.
 */
const props = defineProps<{ home: boolean }>()

const { isDark } = useTheme()
const { position, isNight } = useShowcase()

type Rgb = [number, number, number]
const rgb = (hex: string): Rgb => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]

interface Phase {
  sky: [string, string, string] // top, middle, bottom
  sun: string
  sea: [string, string]
}
const LIGHT: Phase[] = [
  { sky: ['#ffd0a8', '#ffe5cc', '#fff4e0'], sun: '#ff9a4d', sea: ['#35b0bf', '#1d8fa8'] }, // dawn
  { sky: ['#6fcbe6', '#b5e8f1', '#fff3dc'], sun: '#fff08a', sea: ['#1fa3c4', '#0e7fa3'] }, // midday
  { sky: ['#9fc4ea', '#ffd7c0', '#fff0d6'], sun: '#ffc45a', sea: ['#3a9cc0', '#2a78a8'] }, // afternoon
  { sky: ['#ff9e7d', '#ffc9a0', '#ffe9c4'], sun: '#ff6a3a', sea: ['#ee7d62', '#c75a58'] }, // sunset
  { sky: ['#0a1830', '#15325c', '#2a5278'], sun: '#ff6a3a', sea: ['#17406e', '#0c2a4e'] }, // night
]
const DARK: Phase[] = [
  { sky: ['#0d1630', '#3a2a55', '#b9626a'], sun: '#ff9a4d', sea: ['#244a7a', '#14305a'] },
  { sky: ['#04243a', '#0a4a68', '#0f7388'], sun: '#fff08a', sea: ['#0b6f8a', '#064b66'] },
  { sky: ['#13304f', '#2a4f7a', '#6a5f8a'], sun: '#ffc45a', sea: ['#1c5a86', '#123f66'] },
  { sky: ['#1d0e26', '#7d3342', '#e0743f'], sun: '#ff6a3a', sea: ['#b24a45', '#7a2d3a'] },
  { sky: ['#030812', '#091a31', '#12304c'], sun: '#ff6a3a', sea: ['#0d2c4d', '#071b33'] },
]

// Sun position per moment, in % of the viewport (desktop / phones). It rises
// behind the portrait, peaks at midday, sets on the left and is gone at night.
const SUN_X = { wide: [80, 64, 42, 20, 8], narrow: [74, 72, 56, 66, 40] }
const SUN_Y = { wide: [50, 15, 30, 66, 104], narrow: [24, 11, 20, 88, 112] }
const SUN_A = [1, 1, 1, 1, 0]
const SEA_Y = [72, 64, 58, 52, 40] // % of the sea's own height that is still below the screen

const layers: (HTMLElement | null)[] = []
const setLayer = (el: unknown, i: number) => {
  layers[i] = el as HTMLElement | null
}
const sun = ref<HTMLElement | null>(null)
const moon = ref<HTMLElement | null>(null)
const stars = ref<HTMLElement | null>(null)
const sea = ref<HTMLElement | null>(null)
const ready = ref(false)

const STARS = Array.from({ length: 46 }, (_, i) => {
  // deterministic scatter, so the sky is the same on every visit
  const a = Math.sin(i * 12.9898) * 43758.5453
  const b = Math.sin(i * 78.233) * 12345.6789
  const fx = a - Math.floor(a)
  const fy = b - Math.floor(b)
  return { x: fx * 100, y: fy * 58, r: 0.7 + ((i * 7) % 5) * 0.28, twinkle: i % 6 === 0 }
})

const clamp = (v: number, lo = 0, hi = 1) => Math.min(Math.max(v, lo), hi)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const smooth = (t: number) => t * t * (3 - 2 * t)
const at = (list: number[], f: number) => {
  const i = Math.min(Math.floor(f), list.length - 2)
  return lerp(list[i], list[i + 1], smooth(clamp(f - i)))
}
const atColor = (list: Rgb[], f: number): Rgb => {
  const i = Math.min(Math.floor(f), list.length - 2)
  const t = clamp(f - i)
  return [lerp(list[i][0], list[i + 1][0], t), lerp(list[i][1], list[i + 1][1], t), lerp(list[i][2], list[i + 1][2], t)]
}
const css = (c: Rgb, a = 1) => `rgb(${c[0] | 0} ${c[1] | 0} ${c[2] | 0} / ${a})`

let stop: (() => void) | null = null
let paintTheme: (() => void) | null = null
watch(isDark, () => paintTheme?.())

onMounted(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const palette = () => (isDark.value ? DARK : LIGHT)
  let f = 0
  let painted = -1
  let colorF = -9
  let seaBase = 60
  const applySea = () => {
    const seaEl = sea.value
    if (seaEl) seaEl.style.transform = `translate3d(0, ${seaBase}%, 0)`
  }

  paintTheme = () => {
    colorF = -9
    painted = -1
    palette().forEach((phase, i) => {
      const el = layers[i]
      if (el) el.style.background = `linear-gradient(180deg, ${phase.sky[0]} 0%, ${phase.sky[1]} 55%, ${phase.sky[2]} 100%)`
    })
  }
  paintTheme()

  // Scroll positions (viewport centre, in document pixels) where each moment is exact.
  let stops: { y: number; f: number }[] = [{ y: 0, f: 1 }]
  const top = (id: string) => {
    const el = document.getElementById(id)
    return el ? el.getBoundingClientRect().top + window.scrollY : null
  }
  const measure = () => {
    if (!props.home) {
      stops = [{ y: 0, f: 1 }]
      return
    }
    const vh = window.innerHeight
    const p = document.getElementById('projects')
    const pTop = top('projects')
    const eTop = top('experience')
    const cTop = top('contact')
    if (pTop === null || eTop === null || cTop === null || !p) {
      stops = [{ y: 0, f: 0 }]
      return
    }
    const y0 = vh * 0.5
    const y1 = Math.max(pTop + vh * 0.5, y0 + 1)
    const y1b = Math.max(pTop + p.offsetHeight - vh * 0.5, y1)
    const y2 = Math.max(eTop + vh * 0.5, y1b + 1)
    const y3 = Math.max(cTop + vh * 0.35, y2 + 1)
    const hold = y1 + (y1b - y1) * 0.35
    stops = [
      { y: y0, f: 0 },
      { y: y1, f: 1 },
      { y: hold, f: 1 },
      { y: y1b, f: 2 },
      { y: y2, f: 3 },
      { y: y3, f: 4 },
    ]
  }
  const target = () => {
    const y = window.scrollY + window.innerHeight * 0.5
    if (y <= stops[0].y) return stops[0].f
    for (let i = 1; i < stops.length; i++) {
      if (y <= stops[i].y) {
        const a = stops[i - 1]
        const b = stops[i]
        return lerp(a.f, b.f, (y - a.y) / (b.y - a.y))
      }
    }
    return stops[stops.length - 1].f
  }

  f = props.home ? 0 : 1
  let raf = 0
  let last = performance.now()

  const paint = () => {
    const narrow = window.innerWidth < 768
    const pal = palette()
    const pos = narrow ? 'narrow' : 'wide'

    // Sky: dawn is the base; each later moment fades in on top of the previous one.
    for (let i = 1; i < 5; i++) {
      const el = layers[i]
      if (el) el.style.opacity = String(clamp(f - (i - 1)))
    }

    // Sun
    const sunEl = sun.value
    if (sunEl) {
      const size = clamp(Math.min(window.innerWidth, window.innerHeight) * 0.34, 150, 340)
      const sf = reduced ? 1 : f
      const x = (at(SUN_X[pos], sf) / 100) * window.innerWidth
      const y = (at(SUN_Y[pos], sf) / 100) * window.innerHeight
      sunEl.style.width = sunEl.style.height = `${size}px`
      sunEl.style.transform = `translate3d(${x - size / 2}px, ${y - size / 2}px, 0)`
      sunEl.style.opacity = String(reduced ? SUN_A[1] : at(SUN_A, f))
    }

    // Moon and stars: out only at night
    const night = clamp(f - 3)
    const moonEl = moon.value
    if (moonEl) {
      const size = clamp(Math.min(window.innerWidth, window.innerHeight) * 0.16, 80, 170)
      moonEl.style.width = moonEl.style.height = `${size}px`
      moonEl.style.transform = `translate3d(${(narrow ? 0.7 : 0.74) * window.innerWidth - size / 2}px, ${(narrow ? 0.16 : 0.2) * window.innerHeight - size / 2}px, 0)`
      moonEl.style.opacity = String(night)
    }
    if (stars.value) stars.value.style.opacity = String(clamp((f - 3.15) / 0.85))

    // Colours repaint pixels, so they only change in small steps; movement is every frame.
    if (Math.abs(f - colorF) > 0.012 || colorF < -1) {
      colorF = f
      if (sunEl) {
        const c = atColor(pal.map((p) => rgb(p.sun)), f)
        sunEl.style.background = `radial-gradient(circle, ${css(c)} 0 38%, ${css(c, 0.6)} 50%, ${css(c, 0)} 74%)`
      }
      const seaColors = sea.value
      if (seaColors) {
        const [c1, c2] = [0, 1].map((k) => atColor(pal.map((p) => rgb(p.sea[k])), f))
        seaColors.style.setProperty('--sea1', css(c1, 0.55))
        seaColors.style.setProperty('--sea2', css(c2, 0.7))
      }
    }

    // Sea
    const seaEl = sea.value
    if (seaEl) {
      seaBase = reduced ? SEA_Y[1] : at(SEA_Y, f)
      applySea()
    }
  }

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick)
    if (document.hidden) {
      last = now
      return
    }
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    const goal = props.home ? target() : 1
    f += (goal - f) * (1 - Math.exp(-dt * 7))
    position.f = f
    const dark = props.home && f > 3.45
    if (dark !== isNight.value) isNight.value = dark
    if (Math.abs(f - painted) < 0.0008 && ready.value) return
    painted = f
    paint()
    if (!ready.value) ready.value = true
  }

  const remeasure = () => {
    measure()
    painted = -1
    colorF = -9
  }
  measure()
  const observer = new ResizeObserver(remeasure)
  observer.observe(document.body)
  window.addEventListener('resize', remeasure)
  watch(() => props.home, () => requestAnimationFrame(remeasure))
  raf = requestAnimationFrame(tick)

  stop = () => {
    cancelAnimationFrame(raf)
    observer.disconnect()
    window.removeEventListener('resize', remeasure)
  }
})

onBeforeUnmount(() => {
  stop?.()
  paintTheme = null
})
</script>

<template>
  <div class="sky" :class="{ 'is-ready': ready }" aria-hidden="true">
    <div v-for="i in 5" :key="i" :ref="(el) => setLayer(el, i - 1)" class="layer" :style="i === 1 ? '' : 'opacity:0'"></div>

    <svg ref="stars" class="stars" width="100%" height="100%" style="opacity: 0">
      <circle
        v-for="(s, i) in STARS"
        :key="i"
        :cx="`${s.x}%`"
        :cy="`${s.y}%`"
        :r="s.r"
        fill="#fdf3e3"
        :class="s.twinkle ? 'twinkle' : ''"
        :style="s.twinkle ? { animationDelay: `${(i % 5) * 0.7}s` } : undefined"
      />
    </svg>

    <div ref="moon" class="moon" style="opacity: 0"></div>
    <div ref="sun" class="sun"></div>

    <div ref="sea" class="sea">
      <svg class="wave wave-back" viewBox="0 0 1200 200" preserveAspectRatio="none">
        <path d="M0 60 Q150 12 300 60 T600 60 T900 60 T1200 60 V200 H0 Z" />
      </svg>
      <svg class="wave wave-front" viewBox="0 0 1200 200" preserveAspectRatio="none">
        <path d="M0 80 Q150 36 300 80 T600 80 T900 80 T1200 80 V200 H0 Z" />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.sky {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.8s ease;
}
.sky.is-ready {
  opacity: 1;
}
.layer,
.stars {
  position: absolute;
  inset: 0;
}
.layer {
  will-change: opacity;
}

.sun,
.moon {
  position: absolute;
  left: 0;
  top: 0;
  border-radius: 9999px;
  will-change: transform, opacity;
}
.moon {
  background: radial-gradient(circle, #f6f1e2 0 46%, rgb(246 241 226 / 0.35) 58%, rgb(246 241 226 / 0) 74%);
}

.twinkle {
  animation: twinkle 3.2s ease-in-out infinite;
}
@keyframes twinkle {
  50% {
    opacity: 0.25;
  }
}

/* The sea: two waves sliding in opposite directions, behind the page content. */
.sea {
  position: absolute;
  inset: auto 0 0 0;
  height: max(34vh, 220px);
  will-change: transform;
}
.wave {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 200%;
  height: 100%;
}
.wave-back {
  fill: var(--sea1, rgb(30 150 180 / 0.55));
  animation: drift 26s linear infinite reverse;
}
.wave-front {
  fill: var(--sea2, rgb(14 120 160 / 0.7));
  height: 86%;
  animation: drift 17s linear infinite;
}
@keyframes drift {
  to {
    transform: translate3d(-50%, 0, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .wave,
  .twinkle {
    animation: none;
  }
}
</style>
