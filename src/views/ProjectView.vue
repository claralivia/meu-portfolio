<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
  ChevronRightIcon,
  LightBulbIcon,
  PuzzlePieceIcon,
} from '@heroicons/vue/24/outline'
import GithubIcon from '../components/icons/GithubIcon.vue'
import TechIcon from '../components/icons/TechIcon.vue'
import NotFoundView from './NotFoundView.vue'
import BackLink from '../components/BackLink.vue'
import IconTile from '../components/IconTile.vue'
import { useProjects } from '../composables/useProjects'
import { usePageMeta } from '../composables/usePageMeta'
import { useAnalytics } from '../composables/useAnalytics'

const { t } = useI18n()
const route = useRoute()
const { projects, findBySlug } = useProjects()
const { trackClick } = useAnalytics()

const project = computed(() => findBySlug(String(route.params.slug)))

const neighbours = computed(() => {
  const list = projects.value
  const index = list.findIndex((p) => p.slug === project.value?.slug)
  if (index === -1 || list.length < 2) return null
  return {
    prev: list[(index - 1 + list.length) % list.length],
    next: list[(index + 1) % list.length],
  }
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

  <article v-else :key="project.slug" class="py-10 sm:py-16">
    <BackLink to="/#projects" :label="t('caseStudy.back')" />

    <header v-reveal class="card-glass p-6 sm:p-10 mb-8">
      <div class="relative z-10">
        <span class="tech-chip !inline-flex mb-5">{{ t(`projects.filters.${project.category}`) }}</span>

        <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-5">
          {{ project.title }}
        </h1>

        <p class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mb-8">
          {{ project.description }}
        </p>

        <div class="flex flex-wrap items-center gap-3">
          <a
            v-if="project.liveUrl"
            :href="project.liveUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="glass-btn"
            @click="() => trackClick('click_project_live', { project_title: project?.title, section: 'case_study' })"
          >
            {{ t('buttons.live') }}
            <ArrowTopRightOnSquareIcon class="w-4 h-4" />
          </a>
          <a
            v-for="link in githubLinks"
            :key="link.url"
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            class="glass-btn"
            @click="() => trackClick('click_project_github', { project_title: project?.title, link_label: link.label, section: 'case_study' })"
          >
            <GithubIcon class="w-5 h-5" />
            {{ link.label }}
          </a>
        </div>
      </div>
    </header>

    <div v-if="image" v-reveal class="card-glass p-3 sm:p-4 mb-8">
      <img
        :src="image"
        :alt="`${t('caseStudy.screenshot')} ${project.title}`"
        width="960"
        height="540"
        class="relative z-10 w-full rounded-[1.5rem] border border-gray-200 dark:border-gray-700"
      />
    </div>

    <div v-if="project.challenge || project.solution" class="grid md:grid-cols-2 gap-6 mb-8">
      <section v-if="project.challenge" v-reveal class="card-glass p-6 sm:p-8">
        <div class="relative z-10">
          <h2 class="flex items-center gap-3 text-xl font-bold text-neutral-900 dark:text-white mb-4">
            <IconTile :icon="PuzzlePieceIcon" color="pink" size="sm" />
            {{ t('caseStudy.challenge') }}
          </h2>
          <p class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ project.challenge }}</p>
        </div>
      </section>
      <section v-if="project.solution" v-reveal="150" class="card-glass p-6 sm:p-8">
        <div class="relative z-10">
          <h2 class="flex items-center gap-3 text-xl font-bold text-neutral-900 dark:text-white mb-4">
            <IconTile :icon="LightBulbIcon" color="amber" size="sm" />
            {{ t('caseStudy.solution') }}
          </h2>
          <p class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ project.solution }}</p>
        </div>
      </section>
    </div>

    <section v-for="block in (['decisions', 'highlights'] as const)" :key="block">
      <div v-if="project[block]?.length" v-reveal class="card-glass p-6 sm:p-8 mb-8">
        <div class="relative z-10">
          <h2 class="text-xl font-bold text-neutral-900 dark:text-white mb-5">{{ t(`caseStudy.${block}`) }}</h2>
          <ul class="space-y-3">
            <li v-for="item in project[block]" :key="item" class="flex items-start gap-3 text-gray-700 dark:text-gray-300 leading-relaxed">
              <ChevronRightIcon class="w-5 h-5 mt-0.5 text-neutral-400 dark:text-neutral-500 flex-shrink-0" />
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section v-reveal class="card-glass p-6 sm:p-8 mb-12">
      <div class="relative z-10">
        <h2 class="text-xl font-bold text-neutral-900 dark:text-white mb-5">{{ t('caseStudy.stack') }}</h2>
        <div class="flex flex-wrap gap-3">
          <span v-for="tag in project.tags" :key="tag" class="tech-chip">
            <TechIcon :name="tag" />
            {{ tag }}
          </span>
        </div>
      </div>
    </section>

    <nav v-if="neighbours" v-reveal class="grid grid-cols-2 gap-4 sm:gap-6" :aria-label="t('caseStudy.more')">
      <RouterLink :to="`/projetos/${neighbours.prev.slug}`" class="card-glass group p-5 sm:p-6">
        <span class="relative z-10 flex items-center gap-1.5 text-xs font-semibold text-neutral-500 dark:text-gray-400 mb-1.5">
          <ArrowLeftIcon class="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" />
          {{ t('caseStudy.prev') }}
        </span>
        <span class="relative z-10 block text-lg font-bold text-neutral-900 dark:text-white truncate">{{ neighbours.prev.title }}</span>
      </RouterLink>
      <RouterLink :to="`/projetos/${neighbours.next.slug}`" class="card-glass group p-5 sm:p-6 text-right">
        <span class="relative z-10 flex items-center justify-end gap-1.5 text-xs font-semibold text-neutral-500 dark:text-gray-400 mb-1.5">
          {{ t('caseStudy.next') }}
          <ArrowRightIcon class="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
        <span class="relative z-10 block text-lg font-bold text-neutral-900 dark:text-white truncate">{{ neighbours.next.title }}</span>
      </RouterLink>
    </nav>
  </article>
</template>

<style scoped>
.glass-btn {
  @apply flex items-center justify-center gap-2 font-medium text-sm sm:text-base py-2.5 px-5 rounded-2xl bg-gradient-to-br from-white/50 to-white/20 dark:from-white/10 dark:to-white/5 border border-white/50 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/20 hover:shadow-xl hover:from-white/60 hover:to-white/30 dark:hover:from-white/20 dark:hover:to-white/10 hover:-translate-y-1 transition-all duration-300 text-neutral-900 dark:text-white;
}
</style>
