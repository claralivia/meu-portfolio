<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import {
  AcademicCapIcon,
  SparklesIcon,
  WrenchScrewdriverIcon,
  PauseCircleIcon,
} from '@heroicons/vue/24/solid'

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
</script>

<template>
  <section id="education" class="py-16 sm:py-24 relative z-10">
    <h2 class="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl mb-16 text-center">
      {{ t('education.title') }}
    </h2>

    <div class="relative border-l border-gray-300 dark:border-gray-700 ml-10">
      <div v-for="item in items" :key="item.title" class="mb-16 relative group">
        <div
          class="absolute -left-5 top-0 w-10 h-10 rounded-full bg-white/30 dark:bg-neutral-800/70 backdrop-blur-xl flex items-center justify-center z-20 shadow-lg shadow-gray-300/20 dark:shadow-black/20 border border-white/50 dark:border-neutral-700 transition-all duration-500 group-hover:scale-110"
        >
          <AcademicCapIcon v-if="item.type === 'degree'" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <WrenchScrewdriverIcon v-else-if="item.type === 'technical'" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <PauseCircleIcon v-else-if="item.type === 'interrupted'" class="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <SparklesIcon v-else class="w-5 h-5 text-amber-500 dark:text-amber-400" />
        </div>
        <div class="relative z-10 p-6 rounded-2xl ml-8 transition-all duration-500 border backdrop-blur-xl bg-white/10 border-white/30 shadow-xl shadow-gray-300/20 dark:bg-white/5 dark:border-white/20 dark:shadow-black/20 hover:shadow-2xl hover:scale-[1.02] transform origin-top-left">
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-white mb-1">{{ item.title }}</h3>
          <time class="block mb-4 text-sm font-normal leading-none text-gray-500 dark:text-gray-400">{{ item.institution }} | {{ item.date }}</time>
        </div>
      </div>
    </div>
  </section>
</template>