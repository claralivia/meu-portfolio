<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

type DegreeStatus = 'progress' | 'paused' | 'done'

interface Degree {
  kind: string
  title: string
  institution: string
  period: string
  status: DegreeStatus
  statusLabel: string
}

interface Certification {
  title: string
  issuer: string
}

const { t, tm } = useI18n()

const degrees = computed((): Degree[] => (tm('education.degrees') as Degree[]) || [])
const certifications = computed((): Certification[] => (tm('education.certifications') as Certification[]) || [])

const statusStyles: Record<DegreeStatus, { pill: string; dot: string }> = {
  progress: { pill: 'bg-blue-500/10 text-blue-700 ring-blue-500/25 dark:text-blue-300', dot: 'bg-blue-500' },
  paused: { pill: 'bg-slate-500/10 text-slate-600 ring-slate-500/25 dark:text-slate-300', dot: 'bg-slate-400' },
  done: { pill: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/25 dark:text-emerald-300', dot: 'bg-emerald-500' },
}
</script>

<template>
  <section id="education" class="py-16 sm:py-24 relative z-10">
    <h2 class="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl mb-12 text-center">
      {{ t('education.title') }}
    </h2>

    <h3 class="group-label">{{ t('education.degreesTitle') }}</h3>
    <div class="grid md:grid-cols-3 gap-4 sm:gap-6 mb-12">
      <article
        v-for="(degree, index) in degrees"
        :key="degree.title"
        v-reveal="index * 120"
        class="card-glass p-6 flex flex-col"
      >
        <p class="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-gray-400">{{ degree.kind }}</p>
        <h4 class="mt-2 text-lg font-bold leading-snug text-neutral-900 dark:text-white">{{ degree.title }}</h4>
        <p class="mt-1 text-sm text-neutral-600 dark:text-gray-400">{{ degree.institution }}</p>

        <div class="mt-auto pt-5 flex flex-col gap-2">
          <span
            class="inline-flex items-center gap-1.5 self-start rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset"
            :class="statusStyles[degree.status].pill"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="statusStyles[degree.status].dot"></span>
            {{ degree.statusLabel }}
          </span>
          <span class="text-xs text-neutral-500 dark:text-gray-500">{{ degree.period }}</span>
        </div>
      </article>
    </div>

    <h3 class="group-label">{{ t('education.certificationsTitle') }}</h3>
    <ul class="grid md:grid-cols-3 gap-4 sm:gap-6">
      <li
        v-for="(certification, index) in certifications"
        :key="certification.title"
        v-reveal="index * 120"
        class="card-glass !rounded-3xl px-5 py-4 flex flex-col"
      >
        <p class="font-semibold leading-snug text-neutral-900 dark:text-white">{{ certification.title }}</p>
        <p class="mt-auto pt-2 text-sm text-neutral-500 dark:text-gray-400">
          {{ certification.issuer }}
          <span class="mx-1 text-neutral-400" aria-hidden="true">·</span>
          {{ t('education.certificationDone') }}
        </p>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.group-label {
  @apply mb-4 px-1 text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-gray-400;
}
</style>
