<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import { ChevronLeftIcon } from '@heroicons/vue/20/solid'

defineProps<{ to: RouteLocationRaw; label: string }>()
</script>

<template>
  <RouterLink
    :to="to"
    class="group inline-flex items-center gap-2 mb-6 sm:mb-8 py-1.5 pl-1.5 pr-4 rounded-full bg-gradient-to-br from-white/60 to-white/30 dark:from-white/10 dark:to-white/5 border border-white/60 dark:border-white/10 shadow-sm shadow-black/5 text-sm font-semibold text-neutral-700 dark:text-gray-200 hover:shadow-md hover:from-white/80 dark:hover:from-white/15 transition-all duration-300"
  >
    <span class="flex items-center justify-center w-7 h-7 rounded-full bg-white/80 dark:bg-white/10 shadow-sm transition-transform duration-300 group-hover:-translate-x-0.5">
      <ChevronLeftIcon class="w-4 h-4" />
    </span>
    {{ label }}
  </RouterLink>
</template>
