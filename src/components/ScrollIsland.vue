<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useWindowSize } from '@vueuse/core'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { useScroll } from '../composables/useScroll'
import { useProjects } from '../composables/useProjects'
import { useCommandPalette } from '../composables/useCommandPalette'
import { useAnalytics } from '../composables/useAnalytics'

const SECTIONS = ['about', 'projects', 'skills', 'education', 'experience', 'contact']

const { t } = useI18n()
const route = useRoute()
const { y } = useScroll()
const { height } = useWindowSize()
const { findBySlug } = useProjects()
const palette = useCommandPalette()
const { trackClick } = useAnalytics()

const activeSection = ref('about')
let observer: IntersectionObserver | null = null

// Whichever section crosses the middle band of the viewport is the "current" one.
const observeSections = async () => {
  observer?.disconnect()
  if (route.name !== 'home') return
  await nextTick()
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) if (entry.isIntersecting) activeSection.value = entry.target.id
    },
    { rootMargin: '-45% 0px -50% 0px' }
  )
  for (const id of SECTIONS) {
    const el = document.getElementById(id)
    if (el) observer.observe(el)
  }
}

// Watch the route name too: on first load the route starts as the router's
// placeholder (same "/" path, no name) until the initial navigation resolves.
watch(() => [route.name, route.fullPath], observeSections, { immediate: true })
onUnmounted(() => observer?.disconnect())

const label = computed(() => {
  if (route.name === 'project') return findBySlug(String(route.params.slug))?.title ?? ''
  if (route.name === 'about') return t('aboutPage.title')
  if (route.name === 'home') return t(`navbar.${activeSection.value}`)
  return ''
})

const progress = computed(() => {
  const max = Math.max(document.documentElement.scrollHeight - height.value, 1)
  return Math.min(Math.max(y.value / max, 0), 1)
})

const isVisible = computed(() => !!label.value && y.value > (route.name === 'home' ? height.value * 0.6 : 160))

const openPalette = () => {
  palette.open()
  trackClick('open_command_palette', { source: 'island' })
}
</script>

<template>
  <transition
    enter-active-class="transition duration-500 ease-[cubic-bezier(0.34,1.4,0.64,1)]"
    enter-from-class="opacity-0 translate-y-3 md:-translate-y-3 scale-75"
    leave-active-class="transition duration-200 ease-in"
    leave-to-class="opacity-0 translate-y-3 md:-translate-y-3 scale-75"
  >
    <button
      v-if="isVisible"
      class="island fixed left-1/2 bottom-6 md:bottom-auto md:top-[5.25rem] z-30 -translate-x-1/2 max-w-[calc(100vw-9.5rem)] md:max-w-none flex items-center gap-3 pl-4 pr-3 py-2 rounded-full bg-gradient-to-br from-white/70 to-white/40 dark:from-neutral-800/80 dark:to-neutral-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/30 text-sm font-semibold text-neutral-800 dark:text-gray-100 hover:shadow-xl transition-shadow duration-300"
      :aria-label="`${label} — ${t('navbar.search')}`"
      @click="openPalette"
    >
      <transition name="island-label" mode="out-in">
        <span :key="label" class="min-w-0 truncate">{{ label }}</span>
      </transition>

      <span class="relative shrink-0 w-12 sm:w-20 h-1 rounded-full bg-neutral-900/10 dark:bg-white/15 overflow-hidden" aria-hidden="true">
        <span
          class="absolute inset-y-0 left-0 w-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 origin-left"
          :style="{ transform: `scaleX(${progress})` }"
        ></span>
      </span>

      <MagnifyingGlassIcon class="shrink-0 w-4 h-4 text-neutral-500 dark:text-gray-400" />
    </button>
  </transition>
</template>

<style scoped>
.island-label-enter-active,
.island-label-leave-active {
  transition:
    opacity 0.2s ease,
    filter 0.2s ease,
    transform 0.2s ease;
}
.island-label-enter-from,
.island-label-leave-to {
  opacity: 0;
  filter: blur(4px);
  transform: translateY(4px);
}
</style>
