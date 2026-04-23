<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, ref } from 'vue'
import TechIcon from './icons/TechIcon.vue'

interface SkillCategory {
  name: string
  items: string[]
}

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
</script>

<template>
  <section id="skills" class="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-3xl sm:text-4xl font-extrabold text-center text-neutral-900 dark:text-white mb-12">
        {{ t('skills.title') }}
      </h2>

      <div ref="gridRef" class="grid grid-cols-2 md:grid-cols-4 gap-8 skills-grid" @mousemove="handleMouseMove">
        <div v-for="category in skillCategories" :key="category.name" class="card-glass p-6 relative">
          <div class="relative z-10">
            <h3 class="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              {{ category.name }}
            </h3>
  
            <div class="flex flex-wrap gap-3">
              <span
                v-for="item in category.items"
                :key="item"
                class="flex items-center gap-2 text-xs font-semibold tracking-wide py-1.5 px-3.5 rounded-full bg-white/50 border border-white/60 backdrop-blur-md shadow-sm dark:bg-neutral-700/50 dark:border-neutral-600/50 text-neutral-700 dark:text-gray-300 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-default"
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
.card-glass {
  @apply bg-white/40 dark:bg-neutral-800/40 backdrop-blur-2xl border border-white/50 dark:border-neutral-700/50 rounded-[2rem] shadow-xl shadow-black/5 dark:shadow-black/20 transition-all duration-500;
}
.card-glass:hover {
  @apply shadow-2xl shadow-black/10 dark:shadow-black/30 -translate-y-1;
}

/* Efeito Glow Guiado pelo Mouse */
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
:global(.dark) .card-glass::before {
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
