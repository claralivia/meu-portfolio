<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BackLink from '../components/BackLink.vue'
import { usePageMeta } from '../composables/usePageMeta'
import profilePicture from '../assets/minha-foto.webp'

interface JourneyStep {
  period: string
  title: string
  place: string
  note?: string
  current?: boolean
}
interface TextCard {
  title: string
  text: string
}
interface Degree {
  title: string
  institution: string
  statusLabel: string
}
interface Certification {
  title: string
  issuer: string
}
interface SkillCategory {
  name: string
  items: string[]
}

const { t, tm } = useI18n()

const journey = computed(() => (tm('aboutPage.journey') as JourneyStep[]) || [])
const how = computed(() => (tm('aboutPage.how') as TextCard[]) || [])
const hobbies = computed(() => (tm('aboutPage.hobbies') as TextCard[]) || [])
const degrees = computed(() => (tm('education.degrees') as Degree[]) || [])
const certifications = computed(() => (tm('education.certifications') as Certification[]) || [])
const skills = computed(() => (tm('skills.categories') as SkillCategory[]) || [])

usePageMeta(() => ({
  title: `${t('aboutPage.title')} | Clara Lívia`,
  description: t('aboutPage.lead'),
  path: '/sobre',
}))
</script>

<template>
  <article class="pb-20 pt-28 sm:pt-36">
    <BackLink to="/" :label="t('aboutPage.back')" />

    <header class="grid items-end gap-10 md:grid-cols-[1fr_auto] md:gap-16">
      <div>
        <h1 class="text-[clamp(2.75rem,8vw,5rem)] font-semibold leading-none text-ink" style="letter-spacing: -0.04em">{{ t('aboutPage.title') }}</h1>
        <p class="mt-6 max-w-[40ch] text-xl leading-relaxed text-muted sm:text-2xl">{{ t('aboutPage.lead') }}</p>
      </div>
      <div class="glass w-40 rounded-[1.75rem] p-1.5 md:w-56">
        <img :src="profilePicture" alt="Foto de Clara Lívia" width="512" height="512" class="aspect-square w-full rounded-[1.4rem] object-cover" />
      </div>
    </header>

    <section v-reveal class="mt-24 grid gap-10 sm:mt-32 md:grid-cols-3">
      <div v-for="card in how" :key="card.title">
        <h2 class="text-lg font-medium text-ink">{{ card.title }}</h2>
        <p class="mt-2 leading-relaxed text-muted">{{ card.text }}</p>
      </div>
    </section>

    <section v-reveal class="mt-24 sm:mt-32">
      <h2 class="section-title mb-8">{{ t('aboutPage.journeyTitle') }}</h2>
      <ol class="divide-y divide-ink/10 border-y border-ink/10">
        <li v-for="step in journey" :key="step.title" class="grid gap-1 py-5 sm:grid-cols-[13rem_1fr] sm:gap-8">
          <span class="text-sm tabular-nums" :class="step.current ? 'text-accent' : 'text-muted'">{{ step.period }}</span>
          <span>
            <span class="block font-medium text-ink">{{ step.title }}</span>
            <span class="block text-sm text-muted">{{ step.place }}<template v-if="step.note"> · {{ step.note }}</template></span>
          </span>
        </li>
      </ol>
    </section>

    <section v-reveal class="mt-24 grid gap-14 sm:mt-32 md:grid-cols-2 md:gap-16">
      <div>
        <h2 class="section-title mb-8 !text-2xl sm:!text-3xl">{{ t('education.degreesTitle') }}</h2>
        <ul class="space-y-6">
          <li v-for="degree in degrees" :key="degree.title">
            <p class="font-medium text-ink">{{ degree.title }}</p>
            <p class="text-sm text-muted">{{ degree.institution }} · {{ degree.statusLabel }}</p>
          </li>
        </ul>
      </div>
      <div>
        <h2 class="section-title mb-8 !text-2xl sm:!text-3xl">{{ t('education.certificationsTitle') }}</h2>
        <ul class="space-y-6">
          <li v-for="cert in certifications" :key="cert.title">
            <p class="font-medium text-ink">{{ cert.title }}</p>
            <p class="text-sm text-muted">{{ cert.issuer }}</p>
          </li>
        </ul>
      </div>
    </section>

    <section v-reveal class="mt-24 sm:mt-32">
      <h2 class="section-title mb-8">{{ t('skills.title') }}</h2>
      <dl class="glass divide-y divide-ink/10 px-5 sm:px-8">
        <div v-for="category in skills" :key="category.name" class="grid gap-1 py-5 sm:grid-cols-[13rem_1fr] sm:gap-8">
          <dt class="text-sm text-muted">{{ category.name }}</dt>
          <dd class="text-ink">{{ category.items.join(' · ') }}</dd>
        </div>
      </dl>
    </section>

    <section v-reveal class="mt-24 grid gap-10 sm:mt-32 md:grid-cols-[1fr_1.4fr] md:gap-16">
      <div>
        <h2 class="section-title !text-2xl sm:!text-3xl">{{ t('aboutPage.nowTitle') }}</h2>
        <p class="mt-4 leading-relaxed text-muted">{{ t('aboutPage.now') }}</p>
      </div>
      <div>
        <h2 class="section-title mb-6 !text-2xl sm:!text-3xl">{{ t('aboutPage.hobbiesTitle') }}</h2>
        <ul class="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          <li v-for="hobby in hobbies" :key="hobby.title">
            <p class="font-medium text-ink">{{ hobby.title }}</p>
            <p class="text-sm text-muted">{{ hobby.text }}</p>
          </li>
        </ul>
      </div>
    </section>

    <section v-reveal class="mt-24 border-t border-ink/10 pt-12 sm:mt-32">
      <p class="max-w-[24ch] text-3xl font-semibold text-ink sm:text-5xl" style="letter-spacing: -0.03em">{{ t('aboutPage.ctaText') }}</p>
      <RouterLink to="/#contact" class="pill-solid mt-8">{{ t('aboutPage.ctaButton') }}</RouterLink>
    </section>
  </article>
</template>
