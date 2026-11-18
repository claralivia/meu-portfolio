<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { ArrowRightIcon, ArrowUpRightIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'
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
const imageOf = (key: string | undefined) => (key ? demoImages[`../assets/${key}.webp`] : undefined)
const image = computed(() => imageOf(project.value?.key))
const nextImage = computed(() => imageOf(next.value?.key))

// Decisions and highlights are written "Short title: explanation". Show the title
// as a heading and the rest as the body; text without that shape stays whole.
const splitLead = (text: string) => {
  const i = text.indexOf(': ')
  if (i <= 0 || i > 64) return { lead: '', body: text }
  const body = text.slice(i + 2)
  return { lead: text.slice(0, i), body: body.charAt(0).toUpperCase() + body.slice(1) }
}
const decisions = computed(() => (project.value?.decisions ?? []).map(splitLead))
const highlights = computed(() => (project.value?.highlights ?? []).map(splitLead))

// Technologies grouped by role, so the stack reads as an architecture, not a bag.
const GROUPS: Record<string, string[]> = {
  front: ['Vue.js 3', 'Vue.js', 'React', 'Next.js', 'Nuxt.js', 'Vite', 'Tailwind CSS', 'Pinia', 'ApexCharts'],
  back: ['Node.js', 'Express', 'NestJS', 'GraphQL', 'FastAPI', 'Python'],
  data: ['MongoDB', 'PostgreSQL', 'MySQL', 'Supabase', 'Firebase'],
  ai: ['Gemini'],
  infra: ['Vercel', 'Render', 'Cloudflare', 'Monorepo'],
  design: ['UI/UX', 'Design System', 'Glassmorphism'],
  lang: ['TypeScript', 'JavaScript', 'PHP'],
}
const ORDER = ['front', 'back', 'data', 'ai', 'infra', 'design', 'lang', 'other']
const stackGroups = computed(() => {
  const tags = project.value?.tags ?? []
  const buckets: Record<string, string[]> = {}
  for (const tag of tags) {
    const key = Object.keys(GROUPS).find((g) => GROUPS[g].includes(tag)) ?? 'other'
    ;(buckets[key] ||= []).push(tag)
  }
  return ORDER.filter((g) => buckets[g]).map((g) => ({ key: g, items: buckets[g] }))
})

usePageMeta(() => ({
  title: project.value ? `${project.value.title} | Clara Lívia` : `${t('notFound.title')} | Clara Lívia`,
  description: project.value?.description ?? t('notFound.description'),
  path: route.path,
}))
</script>

<template>
  <NotFoundView v-if="!project" />

  <article v-else :key="project.slug" class="page-in pb-24 pt-28 sm:pt-36">
    <div class="read-progress" aria-hidden="true"></div>

    <BackLink to="/#projects" :label="t('caseStudy.back')" />

    <header>
      <h1 class="title-in font-display text-[clamp(2.75rem,9vw,5.5rem)] font-semibold leading-[0.98] text-ink" style="letter-spacing: -0.04em">{{ project.title }}</h1>
      <p class="title-in mt-6 max-w-[52ch] text-lg leading-relaxed text-muted sm:text-xl" style="--d: 90ms">{{ project.description }}</p>

      <div class="title-in mt-8 flex flex-wrap items-center gap-3" style="--d: 170ms">
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

      <dl class="title-in mt-10 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-ink/10 pt-6 sm:max-w-xl" style="--d: 250ms">
        <div>
          <dt class="text-xs text-muted">{{ t('caseStudy.type') }}</dt>
          <dd class="mt-1 font-medium text-ink">{{ t(`projects.filters.${project.category}`) }}</dd>
        </div>
        <div>
          <dt class="text-xs text-muted">{{ t('caseStudy.mainStack') }}</dt>
          <dd class="mt-1 font-medium text-ink">{{ project.tags.slice(0, 3).join(' · ') }}</dd>
        </div>
      </dl>
    </header>

    <!-- A browser window the screenshot sits in; it tips into place as it scrolls in. -->
    <div v-if="image" class="stage mt-12 sm:mt-16">
      <div class="window glass-flat p-2 sm:p-3">
        <div class="flex items-center gap-1.5 px-2 pb-2.5 pt-1" aria-hidden="true">
          <span class="h-2.5 w-2.5 rounded-full bg-ink/15"></span>
          <span class="h-2.5 w-2.5 rounded-full bg-ink/15"></span>
          <span class="h-2.5 w-2.5 rounded-full bg-ink/15"></span>
        </div>
        <img :src="image" :alt="`${t('caseStudy.screenshot')} ${project.title}`" width="960" height="540" class="w-full rounded-lg" />
      </div>
    </div>

    <!-- Problem, then answer: two statements read in sequence. -->
    <section v-if="project.challenge || project.solution" class="mt-20 grid gap-12 sm:mt-28 md:grid-cols-2 md:gap-20">
      <div v-if="project.challenge" v-reveal>
        <h2 class="mb-4 text-sm font-medium text-muted">{{ t('caseStudy.challenge') }}</h2>
        <p class="text-[1.4rem] font-medium leading-snug text-ink sm:text-[1.65rem]" style="letter-spacing: -0.015em">{{ project.challenge }}</p>
      </div>
      <div v-if="project.solution" v-reveal="140">
        <h2 class="mb-4 text-sm font-medium text-accent">{{ t('caseStudy.solution') }}</h2>
        <p class="text-[1.4rem] font-medium leading-snug text-ink sm:text-[1.65rem]" style="letter-spacing: -0.015em">{{ project.solution }}</p>
      </div>
    </section>

    <section v-if="decisions.length" class="mt-20 sm:mt-28">
      <h2 v-reveal class="section-title mb-8 !text-2xl sm:!text-3xl">{{ t('caseStudy.decisions') }}</h2>
      <div class="glass-flat divide-y divide-ink/10 px-5 sm:px-8">
        <details v-for="(item, index) in decisions" :key="item.body" v-reveal="Math.min(index, 4) * 70" class="group py-5 sm:py-6" :open="index === 0">
          <summary class="flex cursor-pointer list-none items-start justify-between gap-4 [&::-webkit-details-marker]:hidden">
            <span class="text-lg font-medium text-ink" style="letter-spacing: -0.01em">{{ item.lead || item.body }}</span>
            <ChevronDownIcon v-if="item.lead" class="mt-1.5 h-4 w-4 shrink-0 text-muted transition-transform duration-500 group-open:rotate-180" aria-hidden="true" />
          </summary>
          <p v-if="item.lead" class="mt-3 max-w-[62ch] leading-relaxed text-muted">{{ item.body }}</p>
        </details>
      </div>
    </section>

    <section v-if="highlights.length" class="mt-20 sm:mt-28">
      <h2 v-reveal class="section-title mb-8 !text-2xl sm:!text-3xl">{{ t('caseStudy.highlights') }}</h2>
      <ul class="track -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0">
        <li v-for="(item, index) in highlights" :key="item.body" v-reveal="Math.min(index, 3) * 80" class="w-[82%] shrink-0 snap-center sm:w-auto">
          <div class="glass-flat h-full p-6">
            <p v-if="item.lead" class="text-lg font-medium text-ink" style="letter-spacing: -0.01em">{{ item.lead }}</p>
            <p class="leading-relaxed text-muted" :class="item.lead ? 'mt-2' : 'text-ink/85'">{{ item.body }}</p>
          </div>
        </li>
      </ul>
    </section>

    <section class="mt-20 sm:mt-28">
      <h2 v-reveal class="section-title mb-8 !text-2xl sm:!text-3xl">{{ t('caseStudy.stack') }}</h2>
      <dl class="divide-y divide-ink/10 border-y border-ink/10">
        <div v-for="(group, gi) in stackGroups" :key="group.key" v-reveal="Math.min(gi, 4) * 60" class="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-8">
          <dt class="text-sm text-muted">{{ t(`caseStudy.groups.${group.key}`) }}</dt>
          <dd class="text-[17px] font-medium text-ink">{{ group.items.join(' · ') }}</dd>
        </div>
      </dl>
    </section>

    <!-- The next project, as a card with its own picture: the story carries on. -->
    <nav v-if="next" class="mt-24 sm:mt-32" :aria-label="t('caseStudy.more')">
      <RouterLink :to="`/projetos/${next.slug}`" class="next group glass-flat relative block overflow-hidden p-2" v-reveal>
        <div class="relative aspect-[16/8] overflow-hidden rounded-lg bg-ink/5 sm:aspect-[16/6]">
          <img :src="nextImage" alt="" width="960" height="540" loading="lazy" class="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" aria-hidden="true"></div>
          <div class="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-8">
            <div class="min-w-0 text-white">
              <p class="text-sm text-white/75">{{ t('caseStudy.next') }}</p>
              <p class="mt-1 truncate text-3xl font-semibold sm:text-5xl" style="letter-spacing: -0.03em">{{ next.title }}</p>
            </div>
            <ArrowRightIcon class="h-7 w-7 shrink-0 text-white transition-transform duration-500 group-hover:translate-x-2" aria-hidden="true" />
          </div>
        </div>
      </RouterLink>
    </nav>
  </article>
</template>

<style scoped>
.page-in {
  animation: page-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes page-in {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
}
.title-in {
  animation: title-in 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--d, 0ms);
}
@keyframes title-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
}

.track {
  scrollbar-width: none;
  overscroll-behavior-x: contain;
}
.track::-webkit-scrollbar {
  display: none;
}

/* Reading progress along the very top of the screen. */
.read-progress {
  display: none;
}
@supports (animation-timeline: scroll()) {
  @media (prefers-reduced-motion: no-preference) {
    .read-progress {
      display: block;
      position: fixed;
      inset: 0 0 auto 0;
      z-index: 50;
      height: 3px;
      background: rgb(var(--accent));
      transform-origin: left;
      transform: scaleX(0);
      animation: read-grow linear both;
      animation-timeline: scroll(root);
    }
    @keyframes read-grow {
      to {
        transform: scaleX(1);
      }
    }

    /* The window tips into place as it arrives. */
    .stage {
      perspective: 1200px;
    }
    .window {
      transform-origin: 50% 100%;
      animation: window-in linear both;
      animation-timeline: view();
      animation-range: entry 0% entry 70%;
    }
    @keyframes window-in {
      from {
        opacity: 0.2;
        transform: rotateX(10deg) translateY(48px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: none;
      }
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .page-in,
  .title-in {
    animation: none;
  }
}
</style>
