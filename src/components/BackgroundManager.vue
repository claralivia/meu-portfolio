<script setup lang="ts">
import { computed } from 'vue'
import { useMouse } from '@vueuse/core'
import { useScroll } from '../composables/useScroll'

const { isScrolled } = useScroll()
const { x, y } = useMouse({ type: 'client' })

const blobStyle = computed(() => ({
  transform: `translate(${x.value - 200}px, ${y.value - 200}px)`,
}))
</script>

<template>
  <div class="fixed inset-0 z-0 overflow-hidden pointer-events-none">
    <div
      class="absolute top-[-10%] -left-20 w-[30rem] h-[30rem] rounded-full bg-gradient-to-r from-blue-300/60 to-indigo-400/50 dark:from-blue-600/40 dark:to-indigo-600/40 blur-[120px] animate-blob"
    ></div>

    <div
      class="absolute top-[40%] -right-20 w-[35rem] h-[35rem] rounded-full bg-gradient-to-tr from-pink-300/60 to-purple-400/50 dark:from-purple-600/40 dark:to-pink-600/40 blur-[140px] animate-blob"
      style="animation-delay: 4s"
    ></div>

    <div
      :style="blobStyle"
      class="absolute top-0 left-0 w-[25rem] h-[25rem] rounded-full bg-gradient-to-br from-emerald-300/60 to-cyan-400/50 dark:from-emerald-500/30 dark:to-cyan-600/30 blur-[100px] transition-transform duration-500 ease-out will-change-transform"
    ></div>
  </div>

  <transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isScrolled"
      class="fixed top-0 left-0 w-full h-32 bg-gradient-to-b from-neutral-100/90 to-transparent dark:from-[#0a0a0a]/90 dark:to-transparent pointer-events-none z-20"
    ></div>
  </transition>

  <div
    class="fixed bottom-0 left-0 w-full h-64 bg-gradient-to-t from-neutral-100/90 to-transparent dark:from-[#0a0a0a]/90 dark:to-transparent pointer-events-none z-20"
  ></div>
</template>

<style scoped>
@keyframes blob {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -20px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 25px) scale(0.9);
  }
}

.animate-blob {
  animation: blob 14s infinite ease-in-out;
}
</style>
