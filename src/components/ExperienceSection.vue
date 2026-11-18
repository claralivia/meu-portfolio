<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useShowcase } from '../composables/useShowcase'

interface ExperienceRole {
  title: string
  date: string
  summary?: string
  points: string[]
}

const { t, tm } = useI18n()
const { isStage, isNight } = useShowcase()

// The story is a flight: oldest role first (departure), the current one last (where
// the plane is now). The data is stored newest first, so it is reversed here.
const roles = computed((): ExperienceRole[] => [...((tm('experience.jobs') as ExperienceRole[]) || [])].reverse())

const clamp = (v: number, lo = 0, hi = 1) => Math.min(Math.max(v, lo), hi)

// ====================================================================== desktop
// A pinned sky. As you scroll, a plane crosses it along a rising route (a career
// that climbs), leaving a contrail; at each stop a cloud with the role appears.
const ROUTE = 'M-40 480 C 150 520 250 380 440 380 S 760 260 1040 150'
const VB = { w: 1000, h: 600 }
const STOPS = [0.2, 0.52, 0.84] // where along the route each role is

const section = ref<HTMLElement | null>(null)
const stage = ref<HTMLElement | null>(null)
const routePath = ref<SVGPathElement | null>(null)
const flown = ref<SVGPathElement | null>(null)
const trail = ref<SVGPathElement | null>(null)
const plane = ref<HTMLElement | null>(null)
const world = ref<HTMLElement | null>(null)
const pins: (HTMLElement | null)[] = []
const cards: (HTMLElement | null)[] = []
const setPin = (el: unknown, i: number) => {
  pins[i] = el as HTMLElement | null
}
const setCard = (el: unknown, i: number) => {
  cards[i] = el as HTMLElement | null
}
const lit = ref<boolean[]>([])
const CARD_W = 304

let stageFrame = 0

// Pins and cards are placed once per size; the plane moves every frame.
const layoutStops = () => {
  const path = routePath.value
  const box = stage.value
  if (!path || !box) return
  const W = box.clientWidth
  const H = box.clientHeight
  const sx = W / VB.w
  const sy = H / VB.h
  const L = path.getTotalLength()
  STOPS.forEach((s, i) => {
    const pt = path.getPointAtLength(L * s)
    const x = pt.x * sx
    const y = pt.y * sy
    const pin = pins[i]
    if (pin) pin.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
    const card = cards[i]
    if (card) {
      const above = i === 0 // the first sits above the route; the others hang below it, clear of the title
      const h = card.offsetHeight
      // Opening the details makes a card taller: keep it between the title and the
      // hills, sliding it along the route's side if it would otherwise be cut off.
      const top = clamp(above ? y - 40 - h : y + 40, 150, H - h - 56)
      card.style.left = `${clamp(x - CARD_W / 2, 16, W - CARD_W - 16)}px`
      card.style.top = `${top}px`
      card.dataset.side = above ? 'above' : 'below'
    }
  })
}

const flyPlane = () => {
  stageFrame = 0
  const sec = section.value
  const box = stage.value
  const path = routePath.value
  const body = plane.value
  if (!sec || !box || !path || !body || !isStage.value) return

  const r = sec.getBoundingClientRect()
  const range = r.height - window.innerHeight
  const progress = range > 0 ? clamp(-r.top / range) : 0
  const tt = clamp((progress - 0.04) / 0.88) // the plane takes off a moment after the sky pins

  // The camera follows the climb: the scene slides back and down a little, so the
  // sky (fixed) and the route (moving) read as two layers at different distances.
  if (world.value) world.value.style.transform = `translate3d(${(-tt * 64).toFixed(1)}px, ${(tt * 22).toFixed(1)}px, 0)`

  const sx = box.clientWidth / VB.w
  const sy = box.clientHeight / VB.h
  const L = path.getTotalLength()
  const at = L * tt
  const p = path.getPointAtLength(at)
  const behind = path.getPointAtLength(Math.max(at - 6, 0))
  const ahead = path.getPointAtLength(Math.min(at + 6, L))
  const angle = Math.atan2((ahead.y - behind.y) * sy, (ahead.x - behind.x) * sx)
  const bob = Math.sin(progress * 38) * 3
  body.style.transform = `translate3d(${p.x * sx}px, ${p.y * sy + bob}px, 0) rotate(${angle}rad)`

  const trailLen = L * 0.3
  flown.value?.setAttribute('stroke-dasharray', `${at} ${L}`)
  trail.value?.setAttribute('stroke-dasharray', `${Math.min(trailLen, at)} ${L}`)
  trail.value?.setAttribute('stroke-dashoffset', String(-Math.max(at - trailLen, 0)))

  const next = STOPS.map((s) => tt >= s - 0.02)
  if (next.join() !== lit.value.join()) lit.value = next
}
const schedule = () => {
  if (!stageFrame) stageFrame = requestAnimationFrame(flyPlane)
}

// ======================================================================= phones
// The same flight, seen from the side: the route runs down the left, the plane
// descends along it and each role lights up as the plane reaches it.
const panel = ref<HTMLElement | null>(null)
const rail = ref<HTMLElement | null>(null)
const fill = ref<HTMLElement | null>(null)
const head = ref<HTMLElement | null>(null)
const nodes: (HTMLElement | null)[] = []
const setNode = (el: unknown, i: number) => {
  nodes[i] = el as HTMLElement | null
}
const litM = ref<boolean[]>([])
let railFrame = 0

const updateRail = () => {
  railFrame = 0
  const box = panel.value
  const line = rail.value
  const bar = fill.value
  const dot = head.value
  const list = nodes.filter((n): n is HTMLElement => !!n)
  if (!box || !line || !bar || !dot || list.length < 2 || isStage.value) return

  const p = box.getBoundingClientRect()
  const center = (n: HTMLElement) => {
    const r = n.getBoundingClientRect()
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  }
  const a = center(list[0])
  const b = center(list[list.length - 1])
  const total = Math.max(b.y - a.y, 1)

  line.style.left = `${a.x - p.left - 1}px`
  line.style.top = `${a.y - p.top}px`
  line.style.height = `${total}px`

  const anchor = window.innerHeight * 0.62
  const progress = clamp((anchor - a.y) / total)
  bar.style.transform = `scaleY(${progress})`
  dot.style.transform = `translate3d(0, ${progress * total}px, 0)`
  dot.style.opacity = progress > 0.005 ? '1' : '0'

  const next = list.map((n) => center(n).y < anchor)
  if (next.join() !== litM.value.join()) litM.value = next
}
const scheduleRail = () => {
  if (!railFrame) railFrame = requestAnimationFrame(updateRail)
}

// ====================================================================== shared
let observer: ResizeObserver | null = null
const refresh = () => {
  layoutStops()
  schedule()
  scheduleRail()
}
onMounted(() => {
  window.addEventListener('scroll', refresh, { passive: true })
  window.addEventListener('resize', refresh)
  observer = new ResizeObserver(refresh)
  if (stage.value) observer.observe(stage.value)
  cards.forEach((c) => c && observer?.observe(c))
  stage.value?.addEventListener('toggle', layoutStops, true)
  if (panel.value) observer.observe(panel.value)
  panel.value?.addEventListener('toggle', scheduleRail, true)
  panel.value?.addEventListener('transitionend', scheduleRail, true)
  nextTick(refresh)
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', refresh)
  window.removeEventListener('resize', refresh)
  panel.value?.removeEventListener('toggle', scheduleRail, true)
  panel.value?.removeEventListener('transitionend', scheduleRail, true)
  stage.value?.removeEventListener('toggle', layoutStops, true)
  observer?.disconnect()
  cancelAnimationFrame(stageFrame)
  cancelAnimationFrame(railFrame)
})
watch([roles, isStage], () => nextTick(refresh))
</script>

<template>
  <section id="experience" ref="section" class="relative" :style="isStage ? { height: '330svh' } : undefined" :aria-label="t('experience.title')">
    <!-- DESKTOP: the sky, pinned, with a plane crossing it. -->
    <div v-if="isStage" ref="stage" class="sticky top-0 h-[100svh] w-screen overflow-hidden" style="margin-left: calc(50% - 50vw)">
      <div class="absolute inset-x-0 top-28 z-10 mx-auto max-w-6xl px-8" :class="{ night: isNight }">
        <h2 class="section-title">{{ t('experience.title') }}</h2>
        <p class="ticket mt-3">
          <svg viewBox="0 0 48 48" width="16" height="16" aria-hidden="true"><path d="M4 24 15 21.5H37Q47 24 37 26.5H15Z M20 21.5 9 6h6l15 15.5Z M20 26.5 9 42h6l15-15.5Z" fill="currentColor" /></svg>
          {{ t('experience.companyName') }}
          <span class="ticket-dot" aria-hidden="true"></span>
          {{ t('experience.companyPeriod') }}
        </p>
      </div>

      <div ref="world" class="world absolute inset-0">
      <svg class="absolute inset-0 h-full w-full" :viewBox="`0 0 ${VB.w} ${VB.h}`" preserveAspectRatio="none" aria-hidden="true">
        <path ref="routePath" :d="ROUTE" class="route route-ghost" />
        <path ref="flown" :d="ROUTE" class="route route-flown" stroke-dasharray="0 9999" />
        <path ref="trail" :d="ROUTE" class="route route-trail" stroke-dasharray="0 9999" />
      </svg>

      <template v-for="(role, i) in roles" :key="role.title">
        <span :ref="(el) => setPin(el, i)" class="pin" :class="{ 'is-lit': lit[i] }" aria-hidden="true"></span>
        <article :ref="(el) => setCard(el, i)" class="stop cloud-card" :class="{ 'is-lit': lit[i] }">
          <p class="flex items-center gap-2 text-sm tabular-nums text-muted">
            {{ role.date }}
            <span v-if="i === roles.length - 1" class="tag !text-accent">{{ t('experience.current') }}</span>
          </p>
          <h3 class="mt-1 font-display text-[1.2rem] font-semibold leading-snug text-ink" style="letter-spacing: -0.015em; text-wrap: balance">{{ role.title }}</h3>
          <p v-if="role.summary" class="mt-1 text-[15px] leading-relaxed text-muted">{{ role.summary }}</p>
          <details class="group mt-2">
            <summary class="cursor-pointer list-none text-sm font-medium text-accent [&::-webkit-details-marker]:hidden">{{ t('experience.details') }}</summary>
            <ul class="mt-2 space-y-1.5 text-sm leading-relaxed text-ink/85">
              <li v-for="point in role.points" :key="point" class="flex gap-2">
                <span class="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-muted" aria-hidden="true"></span>
                <span>{{ point }}</span>
              </li>
            </ul>
          </details>
        </article>
      </template>

      <div ref="plane" class="plane" aria-hidden="true">
        <svg viewBox="0 0 48 48" width="56" height="56">
          <path d="M4 24 15 21.5H37Q47 24 37 26.5H15Z M20 21.5 9 6h6l15 15.5Z M20 26.5 9 42h6l15-15.5Z M9 22.5 3 15h4l7 7.5Z M9 25.5 3 33h4l7-7.5Z" />
        </svg>
      </div>
      </div>
    </div>

    <!-- PHONES: the route runs down the left and the plane flies down it. -->
    <div v-else class="py-20">
      <div class="mb-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 v-reveal class="section-title">{{ t('experience.title') }}</h2>
        <p v-reveal class="text-muted">{{ t('experience.companyName') }} · {{ t('experience.companyPeriod') }}</p>
      </div>

      <div ref="panel" class="relative pl-10">
        <span ref="rail" class="rail" aria-hidden="true">
          <span ref="fill" class="rail-fill"></span>
          <span ref="head" class="rail-plane">
            <svg viewBox="0 0 48 48" width="30" height="30"><path d="M4 24 15 21.5H37Q47 24 37 26.5H15Z M20 21.5 9 6h6l15 15.5Z M20 26.5 9 42h6l15-15.5Z M9 22.5 3 15h4l7 7.5Z M9 25.5 3 33h4l7-7.5Z" /></svg>
          </span>
        </span>

        <details v-for="(role, index) in roles" :key="role.title" v-reveal class="role cloud-card group relative mb-6 p-5 last:mb-0" :open="false">
          <summary class="relative flex cursor-pointer list-none flex-col gap-1 [&::-webkit-details-marker]:hidden">
            <span :ref="(el) => setNode(el, index)" class="node" :class="{ 'is-lit': litM[index], 'is-now': index === roles.length - 1 }" aria-hidden="true"></span>
            <span class="flex items-center gap-2 text-sm tabular-nums text-muted">
              {{ role.date }}
              <span v-if="index === roles.length - 1" class="tag !text-accent">{{ t('experience.current') }}</span>
            </span>
            <span class="font-display text-[1.0625rem] font-semibold leading-snug text-ink" style="letter-spacing: -0.015em; text-wrap: balance">{{ role.title }}</span>
            <span v-if="role.summary" class="text-[15px] leading-relaxed text-muted">{{ role.summary }}</span>
            <span class="mt-1 text-sm font-medium text-accent">{{ t('experience.details') }}</span>
          </summary>
          <ul class="mt-3 space-y-2 text-[15px] leading-relaxed text-ink/85">
            <li v-for="point in role.points" :key="point" class="flex gap-3">
              <span class="mt-[0.7em] h-1 w-1 shrink-0 rounded-full bg-muted" aria-hidden="true"></span>
              <span>{{ point }}</span>
            </li>
          </ul>
        </details>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* The employer and period, as a small boarding-pass chip right under the title. */
.ticket {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.4rem 0.95rem 0.4rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--ink));
  background: rgb(var(--glass) / calc(var(--glass-alpha) + 0.12));
  box-shadow: inset 0 0 0 1px var(--glass-rim);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
}
.ticket-dot {
  width: 4px;
  height: 4px;
  border-radius: 9999px;
  background: rgb(var(--sun));
}

/* ----- Desktop: route, contrail, plane, stops ----- */
.route {
  fill: none;
  stroke-linecap: round;
  vector-effect: non-scaling-stroke;
}
.route-ghost {
  stroke: rgb(var(--ink) / 0.3);
  stroke-width: 2;
  stroke-dasharray: 3 10;
}
.route-flown {
  stroke: rgb(var(--sun));
  stroke-width: 2.6;
}
.route-trail {
  stroke: #fff;
  stroke-width: 15;
  opacity: 0.6;
  filter: blur(5px);
}
.plane {
  position: absolute;
  left: 0;
  top: 0;
  width: 56px;
  height: 56px;
  margin: -28px 0 0 -28px;
  will-change: transform;
  filter: drop-shadow(0 6px 6px rgb(20 40 80 / 0.35));
}
.plane path {
  fill: #fff;
  stroke: rgb(20 40 80 / 0.55);
  stroke-width: 0.9;
  stroke-linejoin: round;
}

/* Each stop on the route is a small cloud. It turns warm and puffs up when the plane
   reaches it, and throws off a few round puffs. */
.pin {
  position: absolute;
  left: 0;
  top: 0;
  width: 40px;
  height: 20px;
  border-radius: 9999px;
  background: #f4f7fc;
  box-shadow: inset 0 -5px 7px rgb(110 140 190 / 0.35);
  transition:
    background 0.5s ease,
    box-shadow 0.5s ease;
}
.pin::before,
.pin::after {
  content: '';
  position: absolute;
  border-radius: 9999px;
  background: inherit;
  box-shadow: inherit;
}
.pin::before {
  width: 22px;
  height: 22px;
  left: 6px;
  top: -12px;
}
.pin::after {
  width: 17px;
  height: 17px;
  left: 20px;
  top: -8px;
}
.pin.is-lit {
  background: #ffe2c2;
  box-shadow:
    inset 0 -5px 7px rgb(255 140 80 / 0.4),
    0 0 20px 6px rgb(var(--sun) / 0.5);
  animation: stop-puff 0.9s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes stop-puff {
  0% {
    scale: 0.6;
  }
  60% {
    scale: 1.35;
  }
  100% {
    scale: 1;
  }
}
.stop {
  position: absolute;
  width: 19rem;
  padding: 1.1rem 1.3rem 1.2rem;
  opacity: 0;
  translate: 0 14px;
  scale: 0.94;
  transition:
    opacity 0.6s ease,
    translate 0.8s cubic-bezier(0.34, 1.56, 0.64, 1),
    scale 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.stop.is-lit {
  opacity: 1;
  translate: 0 0;
  scale: 1;
}

/* ----- Phones: the route down the side ----- */
.rail {
  position: absolute;
  width: 2px;
  border-radius: 2px;
  background: rgb(var(--ink) / 0.16);
}
.rail-fill {
  position: absolute;
  inset: 0;
  border-radius: 2px;
  background: linear-gradient(180deg, rgb(var(--accent)), rgb(var(--sun)));
  transform-origin: top;
  transform: scaleY(0);
  will-change: transform;
}
.rail-plane {
  position: absolute;
  left: 50%;
  top: 0;
  width: 30px;
  height: 30px;
  margin: -15px 0 0 -15px;
  opacity: 0;
  transition: opacity 0.3s ease;
  will-change: transform;
  filter: drop-shadow(0 4px 4px rgb(20 40 80 / 0.35));
}
.rail-plane svg {
  transform: rotate(90deg); /* the plane points down the route */
}
.rail-plane path {
  fill: #fff;
  stroke: rgb(20 40 80 / 0.55);
  stroke-width: 0.9;
  stroke-linejoin: round;
}
.node {
  position: absolute;
  left: -2.55rem;
  top: 0.2rem;
  z-index: 1;
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 9999px;
  background: #fff;
  box-shadow: 0 0 0 3px rgb(var(--ink) / 0.22);
  transition:
    background 0.4s ease,
    box-shadow 0.4s ease,
    transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.node.is-lit {
  background: rgb(var(--sun));
  box-shadow: 0 0 0 4px rgb(var(--sun) / 0.28);
  transform: scale(1.15);
}

@media (prefers-reduced-motion: reduce) {
  .stop,
  .pin,
  .pin.is-lit,
  .node,
  .rail-plane {
    transition: none;
  }
}
</style>
