<script setup lang="ts">
import { computed } from 'vue'
import { findTechIcon } from './techIcons'

const props = defineProps<{ name: string }>()
const icon = computed(() => findTechIcon(props.name))
</script>

<template>
  <svg
    v-if="icon"
    class="tech-icon w-4 h-4 shrink-0 transition-colors duration-300"
    viewBox="0 0 24 24"
    aria-hidden="true"
    :style="icon.color ? { '--brand': icon.color } : undefined"
  >
    <path
      v-if="icon.stroke"
      :d="icon.path"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path v-else :d="icon.path" fill="currentColor" />
  </svg>
  <span v-else aria-hidden="true" class="w-1.5 h-1.5 rounded-full bg-current opacity-50"></span>
</template>

<style scoped>
:global(.tech-chip:hover .tech-icon) {
  color: var(--brand, currentColor);
}
</style>
