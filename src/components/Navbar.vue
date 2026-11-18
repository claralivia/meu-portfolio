<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useScrollLock, useWindowSize } from '@vueuse/core'
import { SunIcon, MoonIcon, LanguageIcon, Bars2Icon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { useAnalytics } from '../composables/useAnalytics'
import { useTheme } from '../composables/useTheme'
import { useCommandPalette } from '../composables/useCommandPalette'
import { useShowcase } from '../composables/useShowcase'

interface NavLink {
  key: 'projects' | 'experience' | 'about' | 'contact'
  to: string
}

const links: NavLink[] = [
  { key: 'projects', to: '/#projects' },
  { key: 'experience', to: '/#experience' },
  { key: 'about', to: '/sobre' },
  { key: 'contact', to: '/#contact' },
]

const { t, locale } = useI18n()
const route = useRoute()
const { trackClick } = useAnalytics()
const { isDark, toggleDark } = useTheme()
const palette = useCommandPalette()
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
const isMenuOpen = ref(false)

const isLocked = useScrollLock(typeof document !== 'undefined' ? document.body : null)
const { width } = useWindowSize()

watch(isMenuOpen, (open) => (isLocked.value = open))
watch(width, (w) => {
  if (w >= 768) isMenuOpen.value = false
})

// On the home page the link for the section in the middle of the viewport is lit.
const activeSection = ref('')
let observer: IntersectionObserver | null = null

const observeSections = async () => {
  observer?.disconnect()
  activeSection.value = ''
  if (route.name !== 'home') return
  await nextTick()
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) activeSection.value = entry.target.id
        else if (activeSection.value === entry.target.id) activeSection.value = ''
      }
    },
    { rootMargin: '-45% 0px -50% 0px' }
  )
  for (const id of ['projects', 'experience', 'contact']) {
    const el = document.getElementById(id)
    if (el) observer.observe(el)
  }
}
watch(() => [route.name, route.fullPath], observeSections, { immediate: true })
onUnmounted(() => observer?.disconnect())

const isActive = (link: NavLink) =>
  link.key === 'about' ? route.name === 'about' : route.name === 'home' && activeSection.value === link.key

const toggleLocale = () => {
  locale.value = locale.value === 'pt' ? 'en' : 'pt'
  trackClick('click_toggle_locale', { locale: locale.value })
}
const switchTheme = () => {
  toggleDark()
  trackClick('click_toggle_theme', { theme: isDark.value ? 'dark' : 'light' })
}
const openPalette = () => {
  isMenuOpen.value = false
  palette.open()
  trackClick('open_command_palette', { source: 'navbar' })
}
const go = (key: string) => {
  trackClick('click_nav', { link: key })
  isMenuOpen.value = false
}

const homeLabel = computed(() => 'Clara Lívia')

// ---- The menu is a cloud: three soft layers (shade, body, light) whose edges are
// roughened by a noise filter (see App.vue), so it billows like real cloud. While
// you scroll the noise is stretched a little, so the billows slowly change shape,
// and the cloud takes the colour of the sky: white by day, rosy in the afternoon,
// peach at sunset, slate blue at night.
const { position, isNight } = useShowcase()
const cloud = ref<HTMLElement | null>(null)

type Rgb = [number, number, number]
const CLOUD_LIGHT: Rgb[] = [[255, 246, 238], [255, 255, 255], [255, 243, 240], [255, 216, 200], [78, 98, 140]]
const CLOUD_DARK: Rgb[] = [[120, 104, 160], [84, 146, 180], [118, 130, 176], [206, 122, 112], [52, 72, 112]]
const cloudAt = (f: number): Rgb => {
  const list = isDark.value ? CLOUD_DARK : CLOUD_LIGHT
  const i = Math.min(Math.floor(f), list.length - 2)
  const k = Math.min(Math.max(f - i, 0), 1)
  return [0, 1, 2].map((c) => list[i][c] + (list[i + 1][c] - list[i][c]) * k) as Rgb
}

// One light loop for the life of the menu: each frame it only compares two numbers
// (scroll position, time of day) and writes to the DOM when one of them moved enough.
let cloudFrame = 0
let paintedF = -9
let paintedY = -999
let reducedMotion = false
const paintCloud = () => {
  cloudFrame = requestAnimationFrame(paintCloud)
  const el = cloud.value
  if (!el) return
  const y = window.scrollY
  if (!reducedMotion && Math.abs(y - paintedY) > 8) {
    paintedY = y
    const fx = 0.0115 + 0.0024 * Math.sin(y / 320)
    const fy = 0.021 + 0.0035 * Math.cos(y / 410)
    document.getElementById('cn-body-turb')?.setAttribute('baseFrequency', `${fx.toFixed(5)} ${fy.toFixed(5)}`)
    document.getElementById('cn-light-turb')?.setAttribute('baseFrequency', `${(fx * 1.25).toFixed(5)} ${(fy * 1.15).toFixed(5)}`)
  }
  const f = position.f
  if (Math.abs(f - paintedF) > 0.03) {
    paintedF = f
    const c = cloudAt(f)
    el.style.setProperty('--cloud', `rgb(${c[0] | 0} ${c[1] | 0} ${c[2] | 0})`)
    el.style.setProperty('--cloud-shade', `rgb(${(c[0] * 0.8) | 0} ${(c[1] * 0.86) | 0} ${Math.min(255, c[2] * 0.97) | 0})`)
  }
}
onMounted(() => {
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  cloudFrame = requestAnimationFrame(paintCloud)
})
onUnmounted(() => cancelAnimationFrame(cloudFrame))
watch(isDark, () => {
  paintedF = -9 // pick the other palette up on the next frame
})
</script>

<template>
  <header class="fixed inset-x-0 top-3 z-40 px-3 sm:top-4 sm:px-6">
    <div ref="cloud" class="cloud-wrap relative mx-auto max-w-4xl" :class="{ night: isNight }">
      <div class="cloud" aria-hidden="true">
        <span class="cl cl-shade"></span>
        <span class="cl cl-body"></span>
        <span class="cl cl-light"></span>
      </div>
      <div class="relative z-10 flex h-12 items-center justify-between pl-5 pr-2">
      <RouterLink to="/" class="flex items-center gap-2 font-display text-[16px] font-semibold tracking-tight text-ink" :aria-label="homeLabel" @click="() => go('home')">
        <span class="h-2.5 w-2.5 rounded-full bg-sun shadow-[0_0_10px_2px_rgb(var(--sun)/0.6)]" aria-hidden="true"></span>
        Clara Lívia
      </RouterLink>

      <nav class="hidden items-center gap-1 md:flex" :aria-label="t('navbar.menu')">
        <RouterLink
          v-for="link in links"
          :key="link.key"
          :to="link.to"
          class="nav-link"
          :class="isActive(link) ? 'is-active' : ''"
          :aria-current="isActive(link) ? 'true' : undefined"
          @click="() => go(link.key)"
        >
          {{ t(`navbar.${link.key}`) }}
        </RouterLink>
      </nav>

      <div class="flex items-center">
        <button class="icon-btn gap-1.5" :aria-label="t('navbar.search')" @click="openPalette">
          <MagnifyingGlassIcon class="h-[18px] w-[18px]" />
          <kbd class="hidden text-[11px] font-medium text-muted lg:inline">{{ isMac ? '⌘K' : 'Ctrl K' }}</kbd>
        </button>
        <button class="icon-btn" :aria-label="t('navbar.toggleTheme')" @click="switchTheme">
          <MoonIcon v-if="isDark" class="h-[18px] w-[18px]" />
          <SunIcon v-else class="h-[18px] w-[18px]" />
        </button>
        <button class="icon-btn gap-1 text-xs font-medium" :aria-label="t('navbar.changeLanguage')" @click="toggleLocale">
          <LanguageIcon class="h-[18px] w-[18px]" />
          {{ locale.toUpperCase() }}
        </button>
        <div class="md:hidden">
          <button
            class="icon-btn"
            :aria-label="isMenuOpen ? t('navbar.closeMenu') : t('navbar.openMenu')"
            :aria-expanded="isMenuOpen"
            @click="isMenuOpen = !isMenuOpen"
          >
            <XMarkIcon v-if="isMenuOpen" class="h-5 w-5" />
            <Bars2Icon v-else class="h-5 w-5" />
          </button>
        </div>
      </div>
      </div>
    </div>

    <transition name="menu">
      <nav
        v-if="isMenuOpen"
        class="fixed inset-0 -z-10 flex flex-col justify-center gap-2 bg-surface/85 px-8 backdrop-blur-2xl md:hidden"
        :aria-label="t('navbar.menu')"
      >
        <RouterLink
          v-for="link in links"
          :key="link.key"
          :to="link.to"
          class="py-2 text-4xl font-semibold text-ink"
          style="letter-spacing: -0.03em"
          @click="() => go(link.key)"
        >
          {{ t(`navbar.${link.key}`) }}
        </RouterLink>
      </nav>
    </transition>
  </header>
</template>

<style scoped>
/* The cloud: shade under, body in the middle, light on top. Each layer is a plain
   soft pill; the SVG filters in App.vue push its edge around with noise. */
.cloud {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.cl {
  position: absolute;
  border-radius: 9999px;
}
.cl-shade {
  inset: 4px -20px -20px -20px;
  background: var(--cloud-shade, #cdd8ea);
  filter: url(#cn-shade);
  opacity: 0.9;
}
.cl-body {
  inset: -8px -14px -8px -14px;
  background: var(--cloud, #fff);
  box-shadow: inset 0 -12px 18px -6px rgb(110 140 190 / 0.35);
  filter: url(#cn-body) drop-shadow(0 12px 12px rgb(30 60 100 / 0.2));
}
.cl-light {
  inset: -13px -6px 22px -6px;
  background: rgb(255 255 255 / 0.9);
  filter: url(#cn-light);
  opacity: 0.8;
}
.night .cl-light {
  opacity: 0.18;
}
.nav-link {
  @apply rounded-full px-3.5 py-1.5 text-sm text-muted transition-colors duration-300 hover:text-ink;
}
.nav-link.is-active {
  @apply text-ink;
  background: rgb(var(--ink) / 0.08);
}
.icon-btn {
  @apply flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-muted transition duration-300 hover:text-ink active:scale-95;
}
.icon-btn:hover {
  background: rgb(var(--ink) / 0.06);
}

.menu-enter-active,
.menu-leave-active {
  transition:
    opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
