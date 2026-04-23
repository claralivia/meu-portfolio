<script setup lang="ts">
import { computed } from 'vue'
import { ArrowUpIcon } from '@heroicons/vue/24/solid'
import { useScroll } from '../composables/useScroll'
import { useAnalytics } from '../composables/useAnalytics'

const { y } = useScroll()
const { trackClick } = useAnalytics()

const isButtonVisible = computed(() => y.value > 400)

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
  trackClick('click_back_to_top')
}
</script>

<template>
  <transition
    enter-active-class="transition ease-out duration-500"
    enter-from-class="opacity-0 translate-y-8 scale-50"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition ease-in duration-300"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-8 scale-50"
  >
    <button
      v-if="isButtonVisible"
      aria-label="Voltar ao topo da página"
      class="fixed bottom-8 right-8 z-40 p-3.5 rounded-full bg-white/40 dark:bg-neutral-800/60 backdrop-blur-2xl border border-white/50 dark:border-neutral-700/50 shadow-xl shadow-black/5 dark:shadow-black/40 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 outline-none"
      @click="scrollToTop"
    >
      <ArrowUpIcon class="w-6 h-6" />
    </button>
  </transition>
</template>
