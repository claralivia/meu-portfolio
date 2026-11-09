<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowUpIcon } from '@heroicons/vue/24/outline'
import { useScroll } from '../composables/useScroll'
import { useAnalytics } from '../composables/useAnalytics'

const { t } = useI18n()
const { y } = useScroll()
const { trackClick } = useAnalytics()

const isVisible = computed(() => y.value > 600)

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  trackClick('click_back_to_top')
}
</script>

<template>
  <transition
    enter-active-class="transition duration-500 ease-out"
    enter-from-class="opacity-0 translate-y-4"
    leave-active-class="transition duration-300 ease-in"
    leave-to-class="opacity-0 translate-y-4"
  >
    <button
      v-if="isVisible"
      :aria-label="t('buttons.backToTop')"
      class="glass fixed bottom-5 right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full text-muted transition duration-300 hover:text-ink active:scale-95 sm:bottom-8 sm:right-8"
      @click="scrollToTop"
    >
      <ArrowUpIcon class="h-5 w-5" />
    </button>
  </transition>
</template>
