<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { ArrowRightIcon, ArrowUpRightIcon } from '@heroicons/vue/24/outline'
import NotFoundView from './NotFoundView.vue'
import BackLink from '../components/BackLink.vue'
import { useProjects } from '../composables/useProjects'
import { usePageMeta } from '../composables/usePageMeta'
import { useAnalytics } from '../composables/useAnalytics'

const { t } = useI18n()
const route = useRoute()
const { projects, findBySlug } = useProjects()
const { trackClick } = useAnalytics()

const project = computed(() => findBySlug(String(route.params.slug)))

const next = computed(() => {
  const list = projects.value
  const index = list.findIndex((p) => p.slug === project.value?.slug)
  if (index === -1 || list.length < 2) return null
  return list[(index + 1) % list.length]
})

const githubLinks = computed(() => {
  const p = project.value
  if (!p) return []
  if (p.githubUrls) return p.githubUrls
  return p.githubUrl ? [{ label: t('caseStudy.code'), url: p.githubUrl }] : []
})

const demoImages = import.meta.glob<string>('../assets/*.webp', { eager: true, import: 'default' })
const image = computed(() => (project.value ? demoImages[`../assets/${project.value.key}.webp`] : undefined))

usePageMeta(() => ({
  title: project.value ? `${project.value.title} | Clara Lívia` : `${t('notFound.title')} | Clara Lívia`,
  description: project.value?.description ?? t('notFound.description'),
  path: route.path,
}))
</script>

<template>
  <NotFoundView v-if="!project" />

  <article v-else :key="project.slug" class="pb-20 pt-28 sm:pt-36">
    <BackLink to="/#projects" :label="t('caseStudy.back')" />

    <header>
      <h1 class="text-[clamp(2.75rem,8vw,5rem)] font-semibold leading-none text-ink" style="letter-spacing: -0.04em">{{ project.title }}</h1>
      <p class="mt-6 max-w-[56ch] text-lg leading-relaxed text-muted sm:text-xl">{{ project.description }}</p>

      <div class="mt-8 flex flex-wrap items-center gap-3">
        <a
          v-if="project.liveUrl"
          :href="project.liveUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="pill-solid"
          @click="() => trackClick('click_project_live', { project_title: project?.title, section: 'case_study' })"
        >
          {{ t('buttons.live') }}
          <ArrowUpRightIcon class="h-4 w-4" />
        </a>
        <a
          v-for="link in githubLinks"
          :key="link.url"
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
          class="pill-glass"
          @click="() => trackClick('click_project_github', { project_title: project?.title, link_label: link.label, section: 'case_study' })"
        >
          {{ link.label }}
        </a>
      </div>
    </header>

    <div v-if="image" v-reveal class="glass mt-12 p-2 sm:mt-16 sm:p-3">
      <img :src="image" :alt="`${t('caseStudy.screenshot')} ${project.title}`" width="960" height="540" class="w-full rounded-lg" />
    </div>

    <div class="mt-16 grid gap-12 sm:mt-24 md:grid-cols-2 md:gap-16">
      <section v-if="project.challenge" v-reveal>
        <h2 class="mb-3 text-sm font-medium text-muted">{{ t('caseStudy.challenge') }}</h2>
        <p class="text-lg leading-relaxed text-ink">{{ project.challenge }}</p>
      </section>
      <section v-if="project.solution" v-reveal="120">
        <h2 class="mb-3 text-sm font-medium text-muted">{{ t('caseStudy.solution') }}</h2>
        <p class="text-lg leading-relaxed text-ink">{{ project.solution }}</p>
      </section>
    </div>

    <template v-for="block in (['decisions', 'highlights'] as const)" :key="block">
      <section v-if="project[block]?.length" v-reveal class="mt-16 sm:mt-24">
        <h2 class="section-title mb-6 !text-2xl sm:!text-3xl">{{ t(`caseStudy.${block}`) }}</h2>
        <ul class="divide-y divide-ink/10 border-y border-ink/10">
          <li v-for="item in project[block]" :key="item" class="py-4 text-[17px] leading-relaxed text-ink/85">{{ item }}</li>
        </ul>
      </section>
    </template>

    <section v-reveal class="mt-16 sm:mt-24">
      <h2 class="mb-4 text-sm font-medium text-muted">{{ t('caseStudy.stack') }}</h2>
      <ul class="flex flex-wrap gap-2">
        <li v-for="tag in project.tags" :key="tag" class="tag !text-sm">{{ tag }}</li>
      </ul>
    </section>

    <nav v-if="next" v-reveal class="mt-20 border-t border-ink/10 pt-10 sm:mt-28" :aria-label="t('caseStudy.more')">
      <RouterLink :to="`/projetos/${next.slug}`" class="group block">
        <span class="text-sm text-muted">{{ t('caseStudy.next') }}</span>
        <span class="mt-2 flex items-center justify-between gap-4 text-3xl font-semibold text-ink sm:text-5xl" style="letter-spacing: -0.03em">
          {{ next.title }}
          <ArrowRightIcon class="h-7 w-7 shrink-0 text-muted transition duration-500 group-hover:translate-x-2 group-hover:text-ink" />
        </span>
      </RouterLink>
    </nav>
  </article>
</template>
