<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'

defineProps<{ to: RouteLocationRaw; label: string }>()
</script>

<template>
  <RouterLink :to="to" class="group mb-8 inline-flex items-center gap-2 text-sm text-muted transition-colors duration-300 hover:text-ink sm:mb-12">
    <ArrowLeftIcon class="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
    {{ label }}
  </RouterLink>
</template>
