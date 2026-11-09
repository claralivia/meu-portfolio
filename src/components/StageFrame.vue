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
const { activeIndex } = useShowcase()

const demoImages = import.meta.glob<string>('../assets/*.webp', { eager: true, import: 'default' })
const imageFor = (key: string) => demoImages[`../assets/${key}.webp`]

const frame = ref<HTMLElement | null>(null)
const photo = ref<HTMLElement | null>(null)
const ready = ref(false)
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
  const layerOpacity: number[] = []

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
    const t3 = contactSlot ? handover(expSlot) : 0

    // Each stage blends from wherever the frame is toward the next slot.
    let box: Box = hero.getBoundingClientRect()
    box = mixBox(box, showSlot.getBoundingClientRect(), t1)
    if (expSlot) box = mixBox(box, expSlot.getBoundingClientRect(), t2)
    if (contactSlot) box = mixBox(box, contactSlot.getBoundingClientRect(), t3)

    const mix = (from: number, to: number, t: number) => from + (to - from) * t
    let radius = mix(32, 18, t1)
    radius = mix(radius, 16, t2)
    const pad = PAD * (1 - t2)

    f.style.transform = `translate3d(${box.left}px, ${box.top}px, 0)`
    f.style.width = `${box.width}px`
    f.style.height = `${box.height}px`
    f.style.padding = `${pad}px`
    f.style.setProperty('--r', `${radius}px`)
    f.style.setProperty('--pad', `${pad}px`)
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
      photoTarget = (t1 < 0.999 || activeIndex.value === 0) && t2 < 0.05 ? 1 : 0
    }

    // Screenshots fade in underneath the portrait, and out as the frame becomes a panel.
    const showcase = smooth(clamp((t1 - 0.3) / 0.5)) * (1 - smooth(clamp(t2 / 0.45)))
    const k = 1 - Math.exp(-dt * (reduced ? 60 : 9))
    photoOpacity += (photoTarget - photoOpacity) * k
    p.style.opacity = String(photoOpacity)
    layers.forEach((layer, i) => {
      if (!layer) return
      const target = i === activeIndex.value ? showcase : 0
      layerOpacity[i] = (layerOpacity[i] ?? 0) + (target - (layerOpacity[i] ?? 0)) * k
      const op = layerOpacity[i]
      layer.style.opacity = String(op)
      // Screenshots slide in the direction of travel instead of only fading.
      const dir = i < activeIndex.value ? -1 : 1
      layer.style.transform = `translate3d(0, ${dir * (1 - op) * 7}%, 0) scale(${1 + (1 - op) * 0.05})`
    })

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
    <div class="relative h-full w-full overflow-hidden" style="border-radius: calc(var(--r, 32px) - var(--pad, 6px))">
      <img
        v-for="(project, index) in projects"
        :key="project.slug"
        :ref="(el) => setLayer(el, index)"
        :src="imageFor(project.key)"
        alt=""
        width="960"
        height="540"
        class="absolute inset-0 h-full w-full object-cover object-top opacity-0"
      />
      <img ref="photo" :src="profilePicture" alt="" width="512" height="512" class="absolute left-0 top-0 object-cover" />
    </div>
  </div>
</template>
