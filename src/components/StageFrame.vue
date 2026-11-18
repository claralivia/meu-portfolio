<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useProjects } from '../composables/useProjects'
import { useShowcase } from '../composables/useShowcase'
import profilePicture from '../assets/minha-foto.webp'

/**
 * One glass frame that carries the whole page. It starts as the portrait in the
 * hero, glides into the projects showcase (where the portrait shrinks onto the
 * round photo in the first screenshot), then widens into the experience panel
 * and finally into the contact panel, where the portrait returns as a small
 * avatar. It is positioned from real elements, so layout stays in the templates:
 * `#hero-slot`, `#showcase-slot`, `#experience-slot`, `#contact-slot` and
 * `#contact-avatar`; each hand-over starts as its section nears the viewport.
 */

// Where the round photo sits inside src/assets/meu-portfolio-pessoal.webp
// (960 x 540): centre and diameter, as fractions of the image.
const SHOT = { w: 960, h: 540, cx: 0.3708, cy: 0.4204, d: 0.1375 }
const PAD = 6 // frame padding while it is a picture frame, px

const { projects } = useProjects()
const { position } = useShowcase()

const demoImages = import.meta.glob<string>('../assets/*.webp', { eager: true, import: 'default' })
const imageFor = (key: string) => demoImages[`../assets/${key}.webp`]

const frame = ref<HTMLElement | null>(null)
const photo = ref<HTMLElement | null>(null)
const ready = ref(false)
const board = ref<SVGElement | null>(null)
const layers: (HTMLElement | null)[] = []
const setLayer = (el: unknown, index: number) => {
  layers[index] = el as HTMLElement | null
}

const clamp = (v: number, lo = 0, hi = 1) => Math.min(Math.max(v, lo), hi)
const smooth = (t: number) => t * t * (3 - 2 * t)

interface Box {
  left: number
  top: number
  width: number
  height: number
}
const mixBox = (from: Box, to: Box, t: number): Box => ({
  left: from.left + (to.left - from.left) * t,
  top: from.top + (to.top - from.top) * t,
  width: from.width + (to.width - from.width) * t,
  height: from.height + (to.height - from.height) * t,
})

let raf = 0

onMounted(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const find = (id: string) => document.getElementById(id)
  let last = performance.now()
  let photoOpacity = 1

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick)
    if (document.hidden) {
      last = now
      return
    }
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now

    const f = frame.value
    const p = photo.value
    const hero = find('hero-slot')
    const showSlot = find('showcase-slot')
    const projectsSection = find('projects')
    if (!f || !p || !hero || !showSlot || !projectsSection) return

    const vh = window.innerHeight
    // 0 while a section is still a screen away, 1 once it has arrived.
    const progress = (section: HTMLElement | null) =>
      section ? smooth(clamp((vh * 0.95 - section.getBoundingClientRect().top) / (vh * 0.9))) : 0

    const expSlot = find('experience-slot')
    const contactSlot = find('contact-slot')
    const t1 = progress(projectsSection)
    // Later hand-overs start once the panel the frame is on has passed the middle
    // of the screen, so the frame never leaves content that is still being read.
    const handover = (previous: HTMLElement | null) =>
      previous ? smooth(clamp((vh * 0.55 - previous.getBoundingClientRect().bottom) / (vh * 0.45))) : 0
    const t2 = expSlot ? handover(showSlot) : 0
    const t3 = contactSlot ? handover(expSlot ?? find('experience')) : 0

    // Each stage blends from wherever the frame is toward the next slot.
    let box: Box = hero.getBoundingClientRect()
    box = mixBox(box, showSlot.getBoundingClientRect(), t1)
    if (expSlot) box = mixBox(box, expSlot.getBoundingClientRect(), t2)
    if (contactSlot && (expSlot || t3 > 0.001)) {
      const c = contactSlot.getBoundingClientRect()
      // With no experience panel to come from, the frame rises into place from below.
      const from = expSlot ? box : { left: c.left, top: c.top + vh * 0.5, width: c.width, height: c.height }
      box = mixBox(from, c, t3)
    }

    const mix = (from: number, to: number, t: number) => from + (to - from) * t
    let radius = mix(32, 18, t1)
    const tPanel = expSlot ? t2 : t3
    radius = mix(radius, 16, tPanel)
    const pad = PAD * (1 - tPanel)

    // The tide. q is the continuous project position (2.4 is 40% of the way from
    // project 3 to 4). Between two projects the wave sweeps the frame away to the
    // left, and the next one sails in from the right on a surfboard.
    const q = position.q
    const lastLayer = layers.length - 1
    const a = Math.min(Math.floor(q), lastLayer)
    const tide = a >= lastLayer ? 0 : q - a
    const pLeave = tide < 0.5 ? smooth(tide / 0.5) : 1
    const pArrive = tide > 0.5 ? (tide - 0.5) / 0.5 : 0
    const arrive = 1 - smooth(pArrive)
    let sailX = 0
    let sailY = 0
    let sailRot = 0
    if (tide > 0.001 && !reduced) {
      if (tide < 0.5) {
        sailX = -Math.pow(pLeave, 1.6) * window.innerWidth * 0.8
        sailY = pLeave * 34
        sailRot = -pLeave * 7
      } else {
        sailX = arrive * window.innerWidth * 0.72
        sailY = Math.sin(pArrive * 16) * (1 - pArrive) * 13
        sailRot = arrive * 5 + Math.sin(pArrive * 11) * (1 - pArrive) * 3
      }
    }
    f.style.transform = `translate3d(${box.left + sailX}px, ${box.top + sailY}px, 0) rotate(${sailRot.toFixed(2)}deg)`
    // Leaving, the frame goes under the wave; arriving, it rides on top of it.
    f.style.zIndex = tide > 0.5 ? '25' : '5'
    f.style.width = `${box.width}px`
    f.style.height = `${box.height}px`
    f.style.padding = `${pad}px`
    f.style.setProperty('--r', `${radius}px`)
    f.style.setProperty('--pad', `${pad}px`)

    // At nightfall the frame turns into dark sea glass, so the sand-coloured text
    // of the contact panel reads. Before that the theme's own glass applies.
    if (t3 > 0.01) {
      const dark = document.documentElement.classList.contains('dark')
      f.style.setProperty('--glass', `${mix(255, 10, t3) | 0} ${mix(255, 26, t3) | 0} ${mix(255, 50, t3) | 0}`)
      f.style.setProperty('--glass-alpha', String(mix(dark ? 0.08 : 0.42, 0.78, t3)))
      f.style.setProperty('--glass-sheen', `rgb(255 255 255 / ${mix(dark ? 0.12 : 0.4, 0.1, t3)})`)
    } else {
      f.style.removeProperty('--glass')
      f.style.removeProperty('--glass-alpha')
      f.style.removeProperty('--glass-sheen')
    }
    f.style.visibility = box.top + box.height < 0 || box.top > vh ? 'hidden' : 'visible'

    const innerW = box.width - pad * 2
    const innerH = box.height - pad * 2

    // The portrait: full frame in the hero, shrinking onto the round photo inside
    // the first screenshot, and back as the avatar in the contact panel.
    const avatar = find('contact-avatar')
    let photoTarget: number
    if (avatar && t3 > 0.01) {
      const r = avatar.getBoundingClientRect()
      p.style.left = `${r.left - box.left - pad}px`
      p.style.top = `${r.top - box.top - pad}px`
      p.style.width = `${r.width}px`
      p.style.height = `${r.height}px`
      p.style.borderRadius = '9999px'
      photoTarget = smooth(clamp((t3 - 0.4) / 0.5))
    } else {
      const scale = Math.max(innerW / SHOT.w, innerH / SHOT.h) // object-cover, top aligned
      const offsetX = (innerW - SHOT.w * scale) / 2
      const d = SHOT.d * SHOT.w * scale
      const endX = offsetX + SHOT.cx * SHOT.w * scale - d / 2
      const endY = SHOT.cy * SHOT.h * scale - d / 2
      p.style.left = `${mix(0, endX, t1)}px`
      p.style.top = `${mix(0, endY, t1)}px`
      p.style.width = `${mix(innerW, d, t1)}px`
      p.style.height = `${mix(innerH, d, t1)}px`
      p.style.borderRadius = `${mix(radius - pad, d / 2, t1)}px`
      photoTarget = (t1 < 0.999 || position.q < 0.6) && t2 < 0.05 ? 1 : 0
    }

    // Screenshots fade in underneath the portrait, and out as the frame becomes a panel.
    const showcase = smooth(clamp((t1 - 0.3) / 0.5)) * (1 - smooth(clamp(expSlot ? t2 / 0.45 : t3 / 0.3)))
    const k = 1 - Math.exp(-dt * (reduced ? 60 : 9))
    photoOpacity += (photoTarget - photoOpacity) * k
    p.style.opacity = String(photoOpacity)
    // The screenshot is swapped halfway, while the wave is over everything.
    const shown = tide < 0.5 ? a : a + 1
    layers.forEach((layer, i) => {
      if (!layer) return
      layer.style.opacity = i === shown ? String(showcase) : '0'
    })
    p.style.transform = 'none'

    // How high the wave stands (0..1); the TideOverlay draws it over the whole page.
    const tri = 1 - Math.abs(tide * 2 - 1)
    position.swell = tide > 0.001 && tide < 0.999 && !reduced ? smooth(clamp(tri)) : 0

    // The surfboard rides under the frame while it arrives, then sinks away.
    const boardEl = board.value
    if (boardEl) {
      const visible = tide > 0.5 && !reduced ? 1 - smooth(clamp((pArrive - 0.72) / 0.28)) : 0
      boardEl.style.opacity = String(visible * showcase)
      boardEl.style.transform = `translate3d(0, ${(1 - visible) * 10}px, 0)`
    }

    if (!ready.value) ready.value = true
  }
  raf = requestAnimationFrame(tick)
})

onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<template>
  <div
    ref="frame"
    class="glass pointer-events-none fixed left-0 top-0 z-[5] box-border opacity-0 transition-opacity duration-700 ease-out"
    :class="ready ? '!opacity-100' : ''"
    style="border-radius: var(--r, 32px); padding: 6px; will-change: transform, width, height"
    aria-hidden="true"
  >
    <!-- The surfboard the project arrives on: it sits under the frame's lower edge. -->
    <svg
      ref="board"
      class="absolute left-[6%] w-[88%] opacity-0"
      style="bottom: -24px; height: 46px; z-index: 5; overflow: visible"
      viewBox="0 0 200 46"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="board-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ffd9a8" />
          <stop offset="1" stop-color="#ff7a45" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="40" rx="104" ry="6" fill="rgb(255 255 255 / 0.55)" />
      <path d="M2 24 Q100 4 198 17 Q100 42 2 24 Z" fill="url(#board-top)" />
      <path d="M12 24 Q100 12 188 19" fill="none" stroke="rgb(255 255 255 / 0.85)" stroke-width="2.6" stroke-linecap="round" />
    </svg>

    <div class="relative h-full w-full overflow-hidden" style="border-radius: calc(var(--r, 32px) - var(--pad, 6px))">
      <img
        v-for="(project, index) in projects"
        :key="project.slug"
        :ref="(el) => setLayer(el, index)"
        :src="imageFor(project.key)"
        alt=""
        width="960"
        height="540"
        :style="{ zIndex: index + 1 }"
        class="absolute inset-0 h-full w-full object-cover object-top opacity-0"
      />
      <img ref="photo" :src="profilePicture" alt="" width="512" height="512" class="absolute left-0 top-0 object-cover" style="z-index: 25" />
    </div>
  </div>
</template>
