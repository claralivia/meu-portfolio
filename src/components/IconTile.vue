<script setup lang="ts">
import type { Component } from 'vue'

// Colored squircle behind a white glyph, like the icons in iOS Settings.
export type TileColor = 'blue' | 'indigo' | 'purple' | 'pink' | 'rose' | 'orange' | 'amber' | 'emerald' | 'teal' | 'sky' | 'slate'

const props = withDefaults(defineProps<{ icon: Component; color: TileColor; size?: 'sm' | 'md' | 'lg' }>(), { size: 'md' })

const gradients: Record<TileColor, string> = {
  blue: 'from-blue-400 to-blue-600 shadow-blue-500/30',
  indigo: 'from-indigo-400 to-indigo-600 shadow-indigo-500/30',
  purple: 'from-purple-400 to-purple-600 shadow-purple-500/30',
  pink: 'from-pink-400 to-pink-600 shadow-pink-500/30',
  rose: 'from-rose-400 to-rose-600 shadow-rose-500/30',
  orange: 'from-orange-400 to-orange-600 shadow-orange-500/30',
  amber: 'from-amber-400 to-amber-600 shadow-amber-500/30',
  emerald: 'from-emerald-400 to-emerald-600 shadow-emerald-500/30',
  teal: 'from-teal-400 to-teal-600 shadow-teal-500/30',
  sky: 'from-sky-400 to-sky-600 shadow-sky-500/30',
  slate: 'from-slate-400 to-slate-600 shadow-slate-500/30',
}

const sizes = {
  sm: 'w-8 h-8 [&>svg]:w-4 [&>svg]:h-4',
  md: 'w-11 h-11 [&>svg]:w-6 [&>svg]:h-6',
  lg: 'w-14 h-14 [&>svg]:w-7 [&>svg]:h-7',
}
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center justify-center rounded-[28%] bg-gradient-to-br text-white shadow-lg ring-1 ring-inset ring-white/25"
    :class="[gradients[props.color], sizes[props.size]]"
    aria-hidden="true"
  >
    <component :is="props.icon" />
  </span>
</template>
