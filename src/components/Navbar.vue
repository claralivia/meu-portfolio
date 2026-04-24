<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDark, useToggle, useScrollLock, useWindowSize } from '@vueuse/core'
import { SunIcon, MoonIcon, LanguageIcon, Bars3Icon, XMarkIcon } from '@heroicons/vue/24/solid'
import { useScroll } from '../composables/useScroll'
import { useAnalytics } from '../composables/useAnalytics'

const { t, locale } = useI18n()
const { trackClick } = useAnalytics()
const isDark = useDark()
const toggleDark = useToggle(isDark)
const isMobileMenuOpen = ref(false)
const navLinks = ['about', 'projects', 'education', 'experience', 'contact']

const { isScrolled } = useScroll()

const isLocked = useScrollLock(typeof document !== 'undefined' ? document.body : null)
const { width } = useWindowSize()

watch(isMobileMenuOpen, (val) => {
  isLocked.value = val
})

watch(width, (newWidth) => {
  if (newWidth >= 768 && isMobileMenuOpen.value) {
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
      <a
        href="#about"
        class="text-2xl font-extrabold tracking-tighter text-neutral-900 dark:text-white"
        @click="() => trackNavClick('about')"
      >
        Clara Lívia
      </a>

      <nav class="hidden md:flex gap-6">
        <a
          v-for="link in navLinks"
          :key="link"
          :href="`#${link}`"
          class="nav-link"
          @click="() => trackNavClick(link)"
        >
          {{ t(`navbar.${link}`) }}
        </a>
      </nav>

      <div class="hidden md:flex items-center gap-3">
        <button
          class="icon-btn"
          aria-label="Toggle theme"
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

        <button class="icon-btn flex gap-1 items-center" aria-label="Change language" @click="toggleLocale">
          <LanguageIcon class="w-6 h-6" />
          <span class="font-medium">{{ locale.toUpperCase() }}</span>
        </button>
      </div>

      <div class="flex md:hidden items-center gap-3">
        <button class="icon-btn flex gap-1 items-center" @click="toggleLocale">
          <LanguageIcon class="w-6 h-6" />
          <span class="font-medium">{{ locale.toUpperCase() }}</span>
        </button>
        <button class="icon-btn" @click="isMobileMenuOpen = !isMobileMenuOpen">
          <XMarkIcon v-if="isMobileMenuOpen" class="w-7 h-7" />
          <Bars3Icon v-else class="w-7 h-7" />
        </button>
      </div>
    </div>

    <transition name="mobile-menu">
      <div
        v-if="isMobileMenuOpen"
        class="md:hidden fixed inset-0 z-20 flex flex-col items-center justify-center gap-8 p-6 min-h-screen bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-3xl"
      >
        <a
          v-for="link in navLinks"
          :key="link"
          :href="`#${link}`"
          class="text-3xl font-semibold tracking-tight text-neutral-800 dark:text-white hover:text-blue-600 transition-colors"
          @click="() => trackNavClick(link)"
        >
          {{ t(`navbar.${link}`) }}
        </a>

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
