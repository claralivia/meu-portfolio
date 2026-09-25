<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import TechIcon from './icons/TechIcon.vue'
import { findTechIcon, techKey } from './icons/techIcons'
import { useProjects } from '../composables/useProjects'
import { useAnalytics } from '../composables/useAnalytics'

const { t } = useI18n()
const router = useRouter()
const { projects, selectedTech } = useProjects()
const { trackClick } = useAnalytics()

// Practices rather than tools; they stay as tags but don't belong in the dock.
const CONCEPTS = new Set(['designsystem', 'uiux', 'glassmorphism', 'monorepo'])

// Only technologies that actually appear in projects, most used first, so every
// icon leads somewhere when clicked.
const items = computed(() => {
  const counts = new Map<string, { name: string; count: number }>()
  for (const project of projects.value) {
    for (const tag of project.tags) {
      const key = techKey(tag)
      if (!findTechIcon(tag) || CONCEPTS.has(key)) continue
      const entry = counts.get(key) ?? { name: tag.replace(/\s+\d+$/, ''), count: 0 }
      entry.count++
      counts.set(key, entry)
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .map(([key, { name, count }]) => ({ key, name, count }))
})

// macOS-style magnification: each icon grows with its proximity to the cursor.
const dock = ref<HTMLElement | null>(null)
const scales = ref<number[]>([])
let frame = 0

const onMove = (e: PointerEvent) => {
  if (e.pointerType !== 'mouse' || frame) return
  frame = requestAnimationFrame(() => {
    frame = 0
    const icons = dock.value?.querySelectorAll<HTMLElement>('[data-dock-item]') ?? []
    scales.value = Array.from(icons, (icon) => {
      const rect = icon.getBoundingClientRect()
      const distance = Math.abs(e.clientX - (rect.left + rect.width / 2))
      return 1 + 0.55 * Math.max(0, 1 - distance / 140)
    })
  })
}

const onLeave = () => {
  cancelAnimationFrame(frame)
  frame = 0
  scales.value = []
}

const select = (key: string, name: string) => {
  selectedTech.value = selectedTech.value === key ? null : key
  trackClick('click_dock_tech', { tech: name, active: String(!!selectedTech.value) })
  if (selectedTech.value) router.push('/#projects')
}
</script>

<template>
  <section aria-labelledby="dock-hint" class="pt-4 pb-2">
    <p id="dock-hint" class="text-center text-sm text-neutral-500 dark:text-gray-400 mb-4">
      {{ t('dock.hint') }}
    </p>

    <div class="flex justify-center">
      <div
        ref="dock"
        class="dock flex items-end gap-1.5 max-w-full md:max-w-none overflow-x-auto md:overflow-visible px-3 py-2.5 rounded-[1.75rem] bg-gradient-to-br from-white/60 to-white/30 dark:from-white/10 dark:to-white/5 md:backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl shadow-black/5 dark:shadow-black/30"
        @pointermove="onMove"
        @pointerleave="onLeave"
      >
        <button
          v-for="(item, index) in items"
          :key="item.key"
          data-dock-item
          class="dock-item group relative flex flex-col items-center shrink-0 outline-none"
          :style="{ '--s': scales[index] ?? 1 }"
          :aria-pressed="selectedTech === item.key"
          :aria-label="t('dock.filterBy', { tech: item.name })"
          @click="select(item.key, item.name)"
        >
          <span
            class="tech-chip dock-tile !p-0 !gap-0 !rounded-2xl flex items-center justify-center"
            :class="selectedTech === item.key ? '!bg-white/70 dark:!bg-white/20' : ''"
          >
            <TechIcon :name="item.name" class="dock-icon" />
          </span>

          <span
            class="tooltip pointer-events-none absolute bottom-full mb-3 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap bg-white/90 dark:bg-neutral-800/90 text-neutral-800 dark:text-gray-100 shadow-md opacity-0 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100"
          >
            {{ item.name }} · {{ t('dock.projects', item.count) }}
          </span>

          <span
            class="mt-1 w-1 h-1 rounded-full transition-opacity duration-300"
            :class="selectedTech === item.key ? 'bg-neutral-800 dark:bg-white opacity-100' : 'opacity-0'"
            aria-hidden="true"
          ></span>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.dock {
  scrollbar-width: none;
}
.dock::-webkit-scrollbar {
  display: none;
}

.dock-tile {
  width: calc(2.5rem * var(--s, 1));
  height: calc(2.5rem * var(--s, 1));
  transition:
    width 0.18s ease-out,
    height 0.18s ease-out,
    background-color 0.3s ease;
}
.dock-item:hover .dock-tile {
  transform: none;
}
.dock-icon {
  width: calc(1.25rem * var(--s, 1)) !important;
  height: calc(1.25rem * var(--s, 1)) !important;
  transition:
    width 0.18s ease-out,
    height 0.18s ease-out;
}
.dock-item:hover :deep(.tech-icon),
.dock-item[aria-pressed='true'] :deep(.tech-icon) {
  color: var(--brand, currentColor);
}
</style>
