<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowRightIcon } from '@heroicons/vue/24/outline'
import BackLink from '../components/BackLink.vue'
import { usePageMeta } from '../composables/usePageMeta'
import profilePicture from '../assets/minha-foto.webp'

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

const story = computed(() => (tm('aboutPage.story') as string[]) || [])
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

    <div class="grid gap-10 md:grid-cols-[1fr_17rem] md:gap-16">
      <div class="order-2 md:order-1">
        <h1 class="font-display text-[clamp(2.4rem,6vw,3.6rem)] font-bold leading-none text-ink" style="letter-spacing: -0.04em">{{ t('aboutPage.title') }}</h1>
        <p class="mt-6 max-w-[30ch] font-display text-[clamp(1.5rem,3.4vw,2.1rem)] font-semibold leading-tight text-ink" style="letter-spacing: -0.025em; text-wrap: balance">
          {{ t('aboutPage.lead') }}
        </p>
        <div class="mt-8 max-w-[58ch] space-y-5 text-lg leading-relaxed text-muted">
          <p v-for="paragraph in story" :key="paragraph">{{ paragraph }}</p>
        </div>
        <RouterLink to="/#experience" class="more mt-8">
          {{ t('aboutPage.journeyLink') }}
          <ArrowRightIcon class="h-4 w-4" aria-hidden="true" />
        </RouterLink>
      </div>

      <figure class="order-1 md:order-2 md:pt-2">
        <img :src="profilePicture" alt="Foto de Clara Lívia" width="512" height="512" class="w-36 rounded-2xl object-cover md:w-full" style="aspect-ratio: 4 / 5; object-position: top" />
        <figcaption class="mt-3 text-sm text-muted">{{ t('aboutPage.photoCaption') }}</figcaption>
      </figure>
    </div>

    <!-- The rest is a plain list: a small label on the left, the facts on the right. -->
    <dl v-reveal class="rows mt-20 sm:mt-28">
      <div class="row">
        <dt>{{ t('aboutPage.nowTitle') }}</dt>
        <dd>{{ t('aboutPage.now') }}</dd>
      </div>
      <div class="row">
        <dt>{{ t('education.degreesTitle') }}</dt>
        <dd>
          <p v-for="degree in degrees" :key="degree.title" class="item">
            {{ degree.title }}
            <span class="text-muted">· {{ degree.institution }} · {{ degree.statusLabel }}</span>
          </p>
        </dd>
      </div>
      <div class="row">
        <dt>{{ t('education.certificationsTitle') }}</dt>
        <dd>
          <p v-for="cert in certifications" :key="cert.title" class="item">
            {{ cert.title }}
            <span class="text-muted">· {{ cert.issuer }}</span>
          </p>
        </dd>
      </div>
      <div v-for="category in skills" :key="category.name" class="row">
        <dt>{{ category.name }}</dt>
        <dd>{{ category.items.join(' · ') }}</dd>
      </div>
    </dl>

    <p v-reveal class="mt-20 max-w-[28ch] font-display text-3xl font-bold text-ink sm:mt-28 sm:text-4xl" style="letter-spacing: -0.03em; text-wrap: balance">
      {{ t('aboutPage.closing') }}
      <RouterLink to="/#contact" class="closing">{{ t('aboutPage.closingLink') }}</RouterLink>
    </p>
  </article>
</template>

<style scoped>
.more {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 15px;
  font-weight: 500;
  color: rgb(var(--ink));
}
.more svg {
  transition: transform 0.25s ease;
}
.more:hover svg {
  transform: translateX(4px);
}

.rows {
  border-top: 1px solid var(--line);
}
.row {
  display: grid;
  gap: 0.35rem;
  padding: 1.1rem 0;
  border-bottom: 1px solid var(--line);
}
@media (min-width: 640px) {
  .row {
    grid-template-columns: 13rem 1fr;
    gap: 2rem;
  }
}
.row dt {
  font-size: 0.9rem;
  color: rgb(var(--muted));
}
.row dd {
  color: rgb(var(--ink));
}
.item + .item {
  margin-top: 0.5rem;
}
.closing {
  color: rgb(var(--accent));
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 6px;
}
</style>
