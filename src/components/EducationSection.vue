<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, ref, onMounted } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import {
  AcademicCapIcon,
  SparklesIcon,
  WrenchScrewdriverIcon,
  PauseCircleIcon,
} from '@heroicons/vue/24/solid'
import { CalendarIcon, BuildingLibraryIcon } from '@heroicons/vue/24/outline'

interface EducationItem {
  title: string
  institution: string
  date: string
  type: 'degree' | 'certification' | 'technical' | 'interrupted'
}

const { t, tm } = useI18n()

const items = computed((): EducationItem[] => {
  return (tm('education.items') as EducationItem[]) || []
})

const gridRef = ref<HTMLElement | null>(null)

const handleMouseMove = (e: MouseEvent) => {
  if (!gridRef.value) return
  const cards = gridRef.value.querySelectorAll('.card-glass')
  for (const card of Array.from(cards)) {
    const htmlCard = card as HTMLElement
    const rect = htmlCard.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    htmlCard.style.setProperty('--mouse-x', `${x}px`)
    htmlCard.style.setProperty('--mouse-y', `${y}px`)
  }
}

const isVisible = ref(false)
const hasAnimated = ref(false)

onMounted(() => {
  useIntersectionObserver(gridRef, ([{ isIntersecting }]) => {
    if (isIntersecting && !isVisible.value) {
      isVisible.value = true
      setTimeout(() => {
        hasAnimated.value = true
      }, 1000)
    }
  }, { threshold: 0.15 })
})
</script>

<template>
  <section id="education" class="py-16 sm:py-24 relative z-10">
    <h2 class="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl mb-16 text-center">
      {{ t('education.title') }}
    </h2>

    <div ref="gridRef" class="relative border-l border-gray-300 dark:border-gray-700 ml-10 education-grid" @mousemove="handleMouseMove">
      <div 
        v-for="(item, index) in items" 
        :key="item.title" 
        class="mb-16 relative group transition-all duration-700 ease-out"
        :class="!isVisible ? 'opacity-0 translate-x-12' : ''"
        :style="!hasAnimated ? { transitionDelay: `${index * 200}ms` } : {}"
      >
        <div
          class="absolute -left-5 top-0 w-10 h-10 rounded-full bg-white/30 dark:bg-neutral-800/70 backdrop-blur-xl flex items-center justify-center z-20 shadow-lg shadow-gray-300/20 dark:shadow-black/20 border border-white/50 dark:border-neutral-700 transition-all duration-500 group-hover:scale-110"
        >
          <AcademicCapIcon v-if="item.type === 'degree'" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <WrenchScrewdriverIcon v-else-if="item.type === 'technical'" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <PauseCircleIcon v-else-if="item.type === 'interrupted'" class="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <SparklesIcon v-else class="w-5 h-5 text-amber-500 dark:text-amber-400" />
        </div>
        <div class="relative z-10 p-8 ml-8 card-glass transform origin-top-left">
          <div class="relative z-10">
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <h3 class="text-xl font-bold text-neutral-900 dark:text-white mb-2 leading-tight">
                  {{ item.title }}
                </h3>
                <div class="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 font-medium">
                  <BuildingLibraryIcon class="w-5 h-5 flex-shrink-0" />
                  <span>{{ item.institution }}</span>
                </div>
              </div>
              <span class="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-full text-xs font-semibold bg-white/10 dark:bg-white/5 text-neutral-700 dark:text-neutral-300 border border-white/20 dark:border-white/10 shadow-sm shadow-black/5 hover:scale-105 hover:shadow-md hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 shrink-0 cursor-default mt-1 sm:mt-0">
                <CalendarIcon class="w-4 h-4" />
                {{ item.date }}
              </span>
            </div>
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
    800px circle at var(--mouse-x, 0) var(--mouse-y, 0),
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
    800px circle at var(--mouse-x, 0) var(--mouse-y, 0),
    rgba(255, 255, 255, 0.08),
    transparent 40%
  );
}
@media (hover: hover) {
  .education-grid:hover .card-glass::before {
    opacity: 1;
  }
}
</style>