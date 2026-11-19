<script setup lang="ts">
import { nextTick, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useScrollLock, useWindowSize } from '@vueuse/core'
import { SunIcon, MoonIcon, Bars2Icon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { useScroll } from '../composables/useScroll'
import { useAnalytics } from '../composables/useAnalytics'
import { useTheme } from '../composables/useTheme'
import { useCommandPalette } from '../composables/useCommandPalette'

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
const { isScrolled } = useScroll()
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
const isMenuOpen = ref(false)

const isLocked = useScrollLock(typeof document !== 'undefined' ? document.body : null)
const { width } = useWindowSize()

watch(isMenuOpen, (open) => (isLocked.value = open))
watch(width, (w) => {
  if (w >= 768) isMenuOpen.value = false
})

// On the home page, the link for the section in the middle of the screen is lit.
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
</script>

<template>
  <header class="bar fixed inset-x-0 top-0 z-40" :class="{ 'is-scrolled': isScrolled || isMenuOpen }">
    <div class="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6">
      <RouterLink to="/" class="font-display text-[17px] font-bold tracking-tight text-ink" aria-label="Clara Lívia" @click="() => go('home')">
        Clara Lívia<span class="text-accent">.</span>
      </RouterLink>

      <nav class="hidden items-center gap-7 md:flex" :aria-label="t('navbar.menu')">
        <RouterLink
          v-for="link in links"
          :key="link.key"
          :to="link.to"
          class="nav-link"
          :class="{ 'is-active': isActive(link) }"
          :aria-current="isActive(link) ? 'true' : undefined"
          @click="() => go(link.key)"
        >
          {{ t(`navbar.${link.key}`) }}
        </RouterLink>
      </nav>

      <div class="flex items-center gap-1">
        <button class="icon-btn" :aria-label="t('navbar.search')" @click="openPalette">
          <MagnifyingGlassIcon class="h-[18px] w-[18px]" />
          <kbd class="hidden text-[11px] font-medium lg:inline">{{ isMac ? '⌘K' : 'Ctrl K' }}</kbd>
        </button>
        <button class="icon-btn" :aria-label="t('navbar.toggleTheme')" @click="switchTheme">
          <MoonIcon v-if="isDark" class="h-[18px] w-[18px]" />
          <SunIcon v-else class="h-[18px] w-[18px]" />
        </button>
        <button class="icon-btn text-xs font-semibold" :aria-label="t('navbar.changeLanguage')" @click="toggleLocale">
          {{ locale.toUpperCase() }}
        </button>
        <div class="md:hidden">
          <button class="icon-btn" :aria-label="isMenuOpen ? t('navbar.closeMenu') : t('navbar.openMenu')" :aria-expanded="isMenuOpen" @click="isMenuOpen = !isMenuOpen">
            <XMarkIcon v-if="isMenuOpen" class="h-5 w-5" />
            <Bars2Icon v-else class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>

    <Transition name="menu">
      <nav v-if="isMenuOpen" class="fixed inset-0 -z-10 flex flex-col justify-center gap-1 bg-surface px-6 md:hidden" :aria-label="t('navbar.menu')">
        <RouterLink
          v-for="link in links"
          :key="link.key"
          :to="link.to"
          class="py-2 font-display text-4xl font-bold text-ink"
          style="letter-spacing: -0.035em"
          @click="() => go(link.key)"
        >
          {{ t(`navbar.${link.key}`) }}
        </RouterLink>
      </nav>
    </Transition>
  </header>
</template>

<style scoped>
/* The only glass left on the site: a thin translucent bar. One blur, nothing else. */
.bar {
  background: rgb(var(--surface) / 0);
  border-bottom: 1px solid transparent;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
}
.bar.is-scrolled {
  background: rgb(var(--surface) / 0.78);
  border-bottom-color: var(--line);
  -webkit-backdrop-filter: blur(14px) saturate(1.4);
  backdrop-filter: blur(14px) saturate(1.4);
}
.nav-link {
  font-size: 15px;
  color: rgb(var(--muted));
  transition: color 0.2s ease;
}
.nav-link:hover,
.nav-link.is-active {
  color: rgb(var(--ink));
}
.icon-btn {
  display: flex;
  height: 2.25rem;
  min-width: 2.25rem;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  border-radius: 9999px;
  padding: 0 0.5rem;
  color: rgb(var(--muted));
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}
.icon-btn:hover {
  color: rgb(var(--ink));
  background: rgb(var(--ink) / 0.06);
}
.menu-enter-active,
.menu-leave-active {
  transition: opacity 0.25s ease;
}
.menu-enter-from,
.menu-leave-to {
  opacity: 0;
}
</style>
