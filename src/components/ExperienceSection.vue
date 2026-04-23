<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { BriefcaseIcon } from '@heroicons/vue/24/solid'

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
</script>

<template>
  <section id="experience" class="py-16 sm:py-24 relative z-10">
    <h2 class="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl mb-16 text-center">
      {{ t('experience.title') }}
    </h2>

    <div class="relative border-l border-gray-300 dark:border-gray-700 ml-10">
      <div v-for="job in experienceJobs" :key="job.title" class="mb-16 relative group">
        <div
          class="absolute -left-5 top-0 w-10 h-10 rounded-full bg-white/40 dark:bg-neutral-800/80 backdrop-blur-2xl flex items-center justify-center z-20 shadow-md shadow-black/5 dark:shadow-black/20 border border-white/50 dark:border-neutral-700/50 transition-all duration-500 group-hover:scale-110"
        >
          <BriefcaseIcon class="w-5 h-5 text-neutral-800 dark:text-gray-300" />
        </div>

        <div
          class="relative z-10 p-8 rounded-[2rem] ml-8 transition-all duration-500 border backdrop-blur-2xl bg-white/40 dark:bg-neutral-800/40 border-white/50 dark:border-neutral-700/50 shadow-xl shadow-black/5 dark:shadow-black/20 hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-black/30 hover:-translate-y-1 transform origin-top-left"
        >
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
            {{ job.title }}
          </h3>
          <time class="block mb-4 text-sm font-normal leading-none text-gray-500 dark:text-gray-400">
            {{ job.company }} | {{ job.date }}
          </time>

          <div class="flex flex-col gap-3">
            <div
              v-for="point in job.points"
              :key="point"
              class="bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-sm rounded-xl p-3 text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              {{ point }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
