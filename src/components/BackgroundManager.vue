<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useScroll } from '../composables/useScroll'

const { isScrolled } = useScroll()

// Radial gradients instead of filter: blur() keep the same soft blobs at a
// fraction of the GPU cost. The cursor blob only follows a real mouse.
const cursorBlob = ref<HTMLElement | null>(null)
let frame = 0

const onMove = (e: PointerEvent) => {
  if (e.pointerType !== 'mouse' || frame) return
  frame = requestAnimationFrame(() => {
    frame = 0
    cursorBlob.value?.style.setProperty('transform', `translate(${e.clientX - 200}px, ${e.clientY - 200}px)`)
  })
}

onMounted(() => window.addEventListener('pointermove', onMove, { passive: true }))

onUnmounted(() => {
  window.removeEventListener('pointermove', onMove)
  cancelAnimationFrame(frame)
})
</script>

<template>
  <div class="fixed inset-0 z-0 overflow-hidden pointer-events-none">
    <div class="blob blob-blue absolute top-[-20%] -left-40 w-[42rem] h-[42rem] drift"></div>

    <div class="blob blob-pink absolute top-[30%] -right-48 w-[50rem] h-[50rem] drift" style="animation-delay: 4s"></div>

    <div
      ref="cursorBlob"
      class="blob blob-green absolute -top-24 -left-24 w-[36rem] h-[36rem] transition-transform duration-500 ease-out will-change-transform"
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
    class="hidden md:block fixed bottom-0 left-0 w-full h-40 bg-gradient-to-t from-neutral-100/80 to-transparent dark:from-[#0a0a0a]/80 dark:to-transparent pointer-events-none z-20"
  ></div>
</template>

<style scoped>
.blob {
  border-radius: 9999px;
}
.blob-blue {
  background: radial-gradient(circle, rgba(147, 197, 253, 0.6), rgba(129, 140, 248, 0.3) 40%, transparent 70%);
}
.blob-pink {
  background: radial-gradient(circle, rgba(249, 168, 212, 0.55), rgba(192, 132, 252, 0.3) 40%, transparent 70%);
}
.blob-green {
  background: radial-gradient(circle, rgba(110, 231, 183, 0.55), rgba(34, 211, 238, 0.25) 40%, transparent 70%);
}
:global(.dark .blob-blue) {
  background: radial-gradient(circle, rgba(37, 99, 235, 0.4), rgba(79, 70, 229, 0.2) 40%, transparent 70%);
}
:global(.dark .blob-pink) {
  background: radial-gradient(circle, rgba(147, 51, 234, 0.4), rgba(219, 39, 119, 0.2) 40%, transparent 70%);
}
:global(.dark .blob-green) {
  background: radial-gradient(circle, rgba(16, 185, 129, 0.3), rgba(8, 145, 178, 0.15) 40%, transparent 70%);
}

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

/* Drifting blobs are desktop-only; on phones they stay put so nothing repaints while scrolling. */
@media (min-width: 768px) and (prefers-reduced-motion: no-preference) {
  .drift {
    animation: blob 14s infinite ease-in-out;
  }
}
</style>
