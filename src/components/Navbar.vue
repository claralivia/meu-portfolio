<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useScrollLock, useWindowSize } from '@vueuse/core'
import { SunIcon, MoonIcon, LanguageIcon, Bars3Icon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/solid'
import { useScroll } from '../composables/useScroll'
import { useAnalytics } from '../composables/useAnalytics'
import { useTheme } from '../composables/useTheme'
import { useCommandPalette } from '../composables/useCommandPalette'

const { t, locale } = useI18n()
const { trackClick } = useAnalytics()
const { isDark, toggleDark } = useTheme()
const palette = useCommandPalette()
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
const isMobileMenuOpen = ref(false)
const navLinks = ['about', 'projects', 'skills', 'education', 'experience', 'contact']

const { isScrolled, y } = useScroll()
// Like iOS large titles: the name folds into the monogram once you scroll.
const isCollapsed = computed(() => y.value > 120 && !isMobileMenuOpen.value)

const isLocked = useScrollLock(typeof document !== 'undefined' ? document.body : null)
const { width } = useWindowSize()

watch(isMobileMenuOpen, (val) => {
  isLocked.value = val
})

watch(width, (newWidth) => {
  if (newWidth >= 1024 && isMobileMenuOpen.value) {
    closeMobileMenu()
  }
})

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}
const toggleLocale = () => {
  locale.value = locale.value === 'pt' ? 'en' : 'pt'
  trackClick('click_toggle_locale', { locale: locale.value })
}

const openPalette = () => {
  closeMobileMenu()
  palette.open()
  trackClick('open_command_palette', { source: 'navbar' })
}

const trackNavClick = (link: string) => {
  trackClick('click_nav', { link })
  closeMobileMenu()
}
</script>

<template>
  <header
    class="sticky top-0 z-30 py-4 transition-all duration-300 ease-in-out border-b"
    :class="{
      'bg-white/50 dark:bg-white/5 backdrop-blur-2xl border-white/50 dark:border-white/10': !isMobileMenuOpen,
      'bg-transparent border-transparent': isMobileMenuOpen,
      'shadow-lg shadow-black/5 dark:shadow-black/20': isScrolled && !isMobileMenuOpen,
    }"
  >
    <div class="relative z-30 max-w-4xl mx-auto flex justify-between items-center px-4 sm:px-0">
      <RouterLink
        to="/#about"
        class="group flex items-center text-neutral-900 dark:text-white"
        aria-label="Clara Lívia"
        @click="() => trackNavClick('about')"
      >
        <span
          class="relative flex items-center justify-center w-10 h-10 shrink-0 rounded-[28%] bg-gradient-to-br from-white/80 to-white/30 dark:from-white/15 dark:to-white/5 border border-white/60 dark:border-white/15 shadow-md shadow-black/5 dark:shadow-black/30 transition-transform duration-300 group-hover:scale-105"
        >
          <span class="text-[15px] font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-blue-600 via-purple-500 to-emerald-500 dark:from-blue-400 dark:via-purple-400 dark:to-emerald-400">CL</span>
          <span
            class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-neutral-900"
            :title="t('about.available')"
          ></span>
        </span>
        <span
          class="overflow-hidden whitespace-nowrap text-xl font-extrabold tracking-tighter transition-all duration-500 ease-out"
          :class="isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[10rem] opacity-100 ml-3'"
          aria-hidden="true"
        >
          Clara Lívia
        </span>
      </RouterLink>

      <nav class="hidden lg:flex gap-6">
        <RouterLink
          v-for="link in navLinks"
          :key="link"
          :to="`/#${link}`"
          class="nav-link"
          @click="() => trackNavClick(link)"
        >
          {{ t(`navbar.${link}`) }}
        </RouterLink>
      </nav>

      <div class="hidden lg:flex items-center gap-2">
        <button class="icon-btn flex items-center gap-1.5" :aria-label="t('navbar.search')" @click="openPalette">
          <MagnifyingGlassIcon class="w-5 h-5" />
          <kbd class="hidden lg:inline text-[11px] font-semibold font-sans px-1.5 py-0.5 rounded-md border border-black/10 dark:border-white/15">{{ isMac ? '⌘K' : 'Ctrl K' }}</kbd>
        </button>

        <button
          class="icon-btn"
          :aria-label="t('navbar.toggleTheme')"
          @click="
            () => {
              toggleDark()
              trackClick('click_toggle_theme', { theme: isDark ? 'dark' : 'light' })
            }
          "
        >
          <MoonIcon v-if="isDark" class="w-6 h-6" />
          <SunIcon v-else class="w-6 h-6" />
        </button>

        <button class="icon-btn flex gap-1 items-center" :aria-label="t('navbar.changeLanguage')" @click="toggleLocale">
          <LanguageIcon class="w-6 h-6" />
          <span class="font-medium">{{ locale.toUpperCase() }}</span>
        </button>
      </div>

      <div class="flex lg:hidden items-center gap-1">
        <button class="icon-btn" :aria-label="t('navbar.search')" @click="openPalette">
          <MagnifyingGlassIcon class="w-6 h-6" />
        </button>
        <button class="icon-btn flex gap-1 items-center" :aria-label="t('navbar.changeLanguage')" @click="toggleLocale">
          <LanguageIcon class="w-6 h-6" />
          <span class="font-medium">{{ locale.toUpperCase() }}</span>
        </button>
        <button
          class="icon-btn"
          :aria-label="isMobileMenuOpen ? t('navbar.closeMenu') : t('navbar.openMenu')"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          <XMarkIcon v-if="isMobileMenuOpen" class="w-7 h-7" />
          <Bars3Icon v-else class="w-7 h-7" />
        </button>
      </div>
    </div>

    <transition name="mobile-menu">
      <div
        v-if="isMobileMenuOpen"
        class="lg:hidden fixed inset-0 z-20 flex flex-col items-center justify-center gap-8 p-6 min-h-screen bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-3xl"
      >
        <RouterLink
          v-for="link in navLinks"
          :key="link"
          :to="`/#${link}`"
          class="text-3xl font-semibold tracking-tight text-neutral-800 dark:text-white hover:text-blue-600 transition-colors"
          @click="() => trackNavClick(link)"
        >
          {{ t(`navbar.${link}`) }}
        </RouterLink>

        <div class="w-12 h-1 bg-gray-300/50 dark:bg-gray-700/50 rounded-full my-2"></div>

        <button
          class="flex items-center gap-3 text-xl font-medium text-neutral-600 dark:text-gray-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
          @click="
            () => {
              toggleDark()
              trackClick('click_toggle_theme', { theme: isDark ? 'dark' : 'light' })
            }
          "
        >
          <MoonIcon v-if="isDark" class="w-6 h-6" />
          <SunIcon v-else class="w-6 h-6" />
          <span>{{ t('navbar.toggleTheme') }}</span>
        </button>
      </div>
    </transition>
  </header>
</template>

<style scoped>
.nav-link {
  @apply text-neutral-600 dark:text-gray-400 hover:text-neutral-900 dark:hover:text-white transition-colors relative font-semibold text-sm tracking-wide;
}
.nav-link::after {
  content: '';
  @apply block h-[2px] bg-neutral-800 dark:bg-white absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-0 transition-all duration-300 rounded-full opacity-0;
}
.nav-link:hover::after {
  @apply w-full opacity-100;
}

.icon-btn {
  @apply p-2 rounded-full transition-all duration-300 
         text-neutral-600 dark:text-gray-400 
         hover:text-neutral-900 dark:hover:text-white 
         hover:bg-black/5 dark:hover:bg-white/10 hover:scale-105 active:scale-95;
}

.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: scale(0.98) translateY(-10px);
}
</style>
