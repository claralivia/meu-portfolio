<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'

interface ExperienceRole {
  title: string
  date: string
  summary?: string
  points: string[]
}

const { t, tm } = useI18n()

// Newest first; all roles belong to the same company.
const roles = computed((): ExperienceRole[] => (tm('experience.jobs') as ExperienceRole[]) || [])
</script>

<template>
  <section id="experience" class="py-20 sm:py-28">
    <div class="mb-10 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 sm:mb-14">
      <h2 v-reveal class="section-title">{{ t('experience.title') }}</h2>
      <p v-reveal class="text-muted">{{ t('experience.companyName') }} · {{ t('experience.companyPeriod') }}</p>
    </div>

    <!-- The glass behind this panel is the StageFrame (App level), which widens into it. -->
    <div id="experience-slot" class="divide-y divide-ink/10 rounded-2xl px-5 sm:px-8">
      <details
        v-for="(role, index) in roles"
        :key="role.title"
        v-reveal="200 + index * 130"
        class="group py-6 sm:py-7"
        :open="false"
      >
        <summary class="flex cursor-pointer list-none items-start gap-4 sm:gap-8 [&::-webkit-details-marker]:hidden">
          <span class="w-28 shrink-0 pt-1 text-sm text-muted tabular-nums sm:w-44">{{ role.date }}</span>
          <span class="min-w-0 flex-1">
            <span class="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span class="text-lg font-medium text-ink sm:text-xl" style="letter-spacing: -0.01em">{{ role.title }}</span>
              <span v-if="index === 0" class="tag !text-accent">{{ t('experience.current') }}</span>
            </span>
            <span v-if="role.summary" class="mt-1 block text-[15px] leading-relaxed text-muted">{{ role.summary }}</span>
          </span>
          <ChevronDownIcon class="mt-1.5 h-4 w-4 shrink-0 text-muted transition-transform duration-500 group-open:rotate-180" aria-hidden="true" />
        </summary>

        <ul class="mt-4 space-y-2 pl-[8.5rem] text-[15px] leading-relaxed text-ink/80 max-sm:pl-0 sm:pl-[13rem]">
          <li v-for="point in role.points" :key="point" class="flex gap-3">
            <span class="mt-[0.7em] h-1 w-1 shrink-0 rounded-full bg-muted" aria-hidden="true"></span>
            <span>{{ point }}</span>
          </li>
        </ul>
      </details>
    </div>
  </section>
</template>
