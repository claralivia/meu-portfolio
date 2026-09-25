<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, ref, type Component } from 'vue'
import { ServerStackIcon, WindowIcon, CircleStackIcon, CloudIcon, WrenchScrewdriverIcon } from '@heroicons/vue/24/outline'
import TechIcon from './icons/TechIcon.vue'
import IconTile, { type TileColor } from './IconTile.vue'

interface SkillCategory {
  icon: string
  name: string
  items: string[]
}

const categoryIcons: Record<string, { icon: Component; color: TileColor }> = {
  backend: { icon: ServerStackIcon, color: 'blue' },
  frontend: { icon: WindowIcon, color: 'pink' },
  database: { icon: CircleStackIcon, color: 'emerald' },
  cloud: { icon: CloudIcon, color: 'sky' },
  tools: { icon: WrenchScrewdriverIcon, color: 'amber' },
}
const categoryIcon = (key: string) => categoryIcons[key] ?? categoryIcons.tools

const { t, tm } = useI18n()
const skillCategories = computed((): SkillCategory[] => (tm('skills.categories') as SkillCategory[]) || [])

const gridRef = ref<HTMLElement | null>(null)

const handleMouseMove = (e: MouseEvent) => {
  if (!gridRef.value) return
  for (const card of gridRef.value.children) {
    const htmlCard = card as HTMLElement
    const rect = htmlCard.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    htmlCard.style.setProperty('--mouse-x', `${x}px`)
    htmlCard.style.setProperty('--mouse-y', `${y}px`)
  }
}

// 6-column grid: the first two cards take half a row, the rest a third, so five
// categories never leave one card stranded on its own line.
const spanClass = (index: number, total: number) => {
  const classes = [index < 2 ? 'md:col-span-3' : 'md:col-span-2']
  if (total % 2 === 1 && index === total - 1) classes.push('sm:col-span-2')
  return classes.join(' ')
}
</script>

<template>
  <section id="skills" class="py-16 sm:py-24">
      <h2 class="text-3xl sm:text-4xl font-extrabold text-center text-neutral-900 dark:text-white mb-12">
        {{ t('skills.title') }}
      </h2>

      <div ref="gridRef" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-6 md:gap-8 skills-grid" @mousemove="handleMouseMove">
        <div 
          v-for="(category, index) in skillCategories" 
          :key="category.name" 
          v-reveal="index * 150"
          class="card-glass p-6 relative min-w-0"
          :class="spanClass(index, skillCategories.length)"
        >
          <div class="relative z-10">
            <h3 class="flex items-center gap-3 text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              <IconTile :icon="categoryIcon(category.icon).icon" :color="categoryIcon(category.icon).color" size="sm" />
              {{ category.name }}
            </h3>
  
            <div class="flex flex-wrap gap-2.5">
              <span
                v-for="item in category.items"
                :key="item"
                class="tech-chip"
              >
                <TechIcon :name="item" />
                {{ item }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
</template>

<style scoped>
.card-glass::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(
    600px circle at var(--mouse-x, 0) var(--mouse-y, 0),
    rgba(255, 255, 255, 0.4),
    transparent 40%
  );
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
  z-index: 0;
}
:global(.dark .skills-grid .card-glass::before) {
  background: radial-gradient(
    600px circle at var(--mouse-x, 0) var(--mouse-y, 0),
    rgba(255, 255, 255, 0.08),
    transparent 40%
  );
}
@media (hover: hover) {
  .skills-grid:hover .card-glass::before {
    opacity: 1;
  }
}
</style>
