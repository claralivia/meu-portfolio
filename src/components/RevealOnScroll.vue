<script setup lang="ts">
import { ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

const target = ref<HTMLElement | null>(null)
const isVisible = ref(false)

const { stop } = useIntersectionObserver(
  target,
  ([{ isIntersecting }]) => {
    if (isIntersecting) {
      isVisible.value = true
      stop()
    }
  },
  { threshold: 0.15 }
)
</script>

<template>
  <div
    ref="target"
    class="transition-all duration-[1200ms] ease-out will-change-[opacity,transform]"
    :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'"
  >
    <slot />
  </div>
</template>