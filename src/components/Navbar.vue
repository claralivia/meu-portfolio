<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useScrollLock, useWindowSize } from '@vueuse/core'
import { SunIcon, MoonIcon, LanguageIcon, Bars2Icon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
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
</script>

<template>
  <header class="fixed inset-x-0 top-3 z-40 px-3 sm:top-4 sm:px-6">
    <div class="glass mx-auto flex h-12 max-w-4xl items-center justify-between rounded-full pl-5 pr-2">
      <RouterLink to="/" class="text-[15px] font-semibold tracking-tight text-ink" :aria-label="homeLabel" @click="() => go('home')">
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
.nav-link {
  @apply rounded-full px-3.5 py-1.5 text-sm text-muted transition-colors duration-300 hover:text-ink;
}
.nav-link.is-active {
  @apply text-ink;
  background: rgb(var(--ink) / 0.07);
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
