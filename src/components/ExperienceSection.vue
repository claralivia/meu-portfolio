<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

interface ExperienceRole {
  title: string
  date: string
  points: string[]
  // Optional impact numbers, e.g. { value: "-80%", label: "tempo de resposta" }.
  metrics?: { value: string; label: string }[]
}

const { t, tm } = useI18n()

// Newest first; all roles belong to the same company, grouped under one header.
const roles = computed((): ExperienceRole[] => (tm('experience.jobs') as ExperienceRole[]) || [])
</script>

<template>
  <section id="experience" class="py-16 sm:py-24 relative z-10">
    <h2 class="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl mb-12 text-center">
      {{ t('experience.title') }}
    </h2>

    <article v-reveal class="card-glass hover:!translate-y-0 p-5 sm:p-8 md:p-10">
      <header class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pb-6 mb-6 border-b border-neutral-900/10 dark:border-white/10">
        <div class="min-w-0">
          <h3 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">{{ t('experience.companyName') }}</h3>
          <p class="text-sm text-neutral-500 dark:text-gray-400">{{ t('experience.companyLegal') }}</p>
        </div>
        <span class="text-sm font-semibold text-neutral-600 dark:text-gray-300 whitespace-nowrap">{{ t('experience.companyPeriod') }}</span>
      </header>

      <ol class="relative">
        <li v-for="(role, index) in roles" :key="role.title" class="relative pl-7 sm:pl-9 pb-8 last:pb-0">
          <!-- Progression rail: current role highlighted, earlier ones muted. -->
          <span
            v-if="index < roles.length - 1"
            class="absolute left-[5px] sm:left-[7px] top-4 bottom-0 w-px bg-neutral-900/10 dark:bg-white/15"
            aria-hidden="true"
          ></span>
          <span
            class="absolute left-0 top-1.5 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white dark:border-neutral-900"
            :class="index === 0 ? 'bg-emerald-500 ring-4 ring-emerald-500/20' : 'bg-neutral-300 dark:bg-neutral-600'"
            aria-hidden="true"
          ></span>

          <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h4 class="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">{{ role.title }}</h4>
            <span
              v-if="index === 0"
              class="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-500/25 dark:text-emerald-300"
            >
              {{ t('experience.current') }}
            </span>
          </div>
          <p class="mt-0.5 text-sm text-neutral-500 dark:text-gray-400">{{ role.date }}</p>

          <div v-if="role.metrics?.length" class="flex flex-wrap gap-3 mt-4">
            <div
              v-for="metric in role.metrics"
              :key="metric.label"
              class="px-4 py-2.5 rounded-2xl bg-white/30 dark:bg-white/5 ring-1 ring-inset ring-white/40 dark:ring-white/10"
            >
              <p class="text-xl font-extrabold tracking-tight text-neutral-900 dark:text-white">{{ metric.value }}</p>
              <p class="text-xs font-medium text-neutral-600 dark:text-gray-400">{{ metric.label }}</p>
            </div>
          </div>

          <ul class="mt-3 space-y-2">
            <li
              v-for="point in role.points"
              :key="point"
              class="relative pl-4 text-[15px] leading-relaxed text-gray-700 dark:text-gray-300 before:absolute before:left-0 before:top-[0.6em] before:w-1.5 before:h-1.5 before:rounded-full before:bg-neutral-400 dark:before:bg-neutral-500"
            >
              {{ point }}
            </li>
          </ul>
        </li>
      </ol>
    </article>
  </section>
</template>
