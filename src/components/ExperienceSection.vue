<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, ref, onMounted } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import { BriefcaseIcon } from '@heroicons/vue/24/solid'
import { CalendarIcon, BuildingOfficeIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

interface ExperienceJob {
  title: string
  company: string
  date: string
  points: string[]
}

const { t, tm } = useI18n()

const experienceJobs = computed((): ExperienceJob[] => {
  return (tm('experience.jobs') as ExperienceJob[]) || []
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
  <section id="experience" class="py-16 sm:py-24 relative z-10">
    <h2 class="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl mb-16 text-center">
      {{ t('experience.title') }}
    </h2>

    <div ref="gridRef" class="relative border-l border-gray-300 dark:border-gray-700 ml-10 experience-grid" @mousemove="handleMouseMove">
      <div 
        v-for="(job, index) in experienceJobs" 
        :key="job.title" 
        class="mb-16 relative group transition-all duration-700 ease-out"
        :class="!isVisible ? 'opacity-0 translate-x-12' : ''"
        :style="!hasAnimated ? { transitionDelay: `${index * 200}ms` } : {}"
      >
        <div
          class="absolute -left-5 top-0 w-10 h-10 rounded-full bg-white/40 dark:bg-neutral-800/80 backdrop-blur-2xl flex items-center justify-center z-20 shadow-md shadow-black/5 dark:shadow-black/20 border border-white/50 dark:border-neutral-700/50 transition-all duration-500 group-hover:scale-110"
        >
          <BriefcaseIcon class="w-5 h-5 text-neutral-800 dark:text-gray-300" />
        </div>

        <div
          class="relative z-10 p-8 ml-8 card-glass transform origin-top-left"
        >
          <div class="relative z-10">
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
              <div>
                <h3 class="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                  {{ job.title }}
                </h3>
                <div class="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 font-medium">
                  <BuildingOfficeIcon class="w-5 h-5 flex-shrink-0" />
                  <span>{{ job.company }}</span>
                </div>
              </div>
              <span class="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-full text-xs font-semibold bg-white/10 dark:bg-white/5 text-neutral-700 dark:text-neutral-300 border border-white/20 dark:border-white/10 shadow-sm shadow-black/5 hover:scale-105 hover:shadow-md hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 shrink-0 cursor-default">
                <CalendarIcon class="w-4 h-4" />
                {{ job.date }}
              </span>
            </div>
  
            <ul class="space-y-3">
              <li
                v-for="point in job.points"
                :key="point"
                class="flex items-start gap-3 text-gray-700 dark:text-gray-300 leading-relaxed"
              >
                <ChevronRightIcon class="w-5 h-5 mt-0.5 text-neutral-400 dark:text-neutral-500 flex-shrink-0" />
                <span>{{ point }}</span>
              </li>
            </ul>
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
  .experience-grid:hover .card-glass::before {
    opacity: 1;
  }
}
</style>
