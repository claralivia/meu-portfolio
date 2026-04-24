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
      class="fixed bottom-8 right-8 z-40 p-3.5 rounded-full bg-gradient-to-br from-white/50 to-white/20 dark:from-white/10 dark:to-white/5 backdrop-blur-3xl border border-white/50 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/20 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:from-white/60 hover:to-white/30 dark:hover:from-white/20 dark:hover:to-white/10 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 outline-none"
      @click="scrollToTop"
    >
      <ArrowUpIcon class="w-6 h-6" />
    </button>
  </transition>
</template>
