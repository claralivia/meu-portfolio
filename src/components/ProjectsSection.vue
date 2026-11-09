<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowUpRightIcon } from '@heroicons/vue/24/outline'
import { useAnalytics } from '../composables/useAnalytics'
import { useProjects, type Project } from '../composables/useProjects'
import { useShowcase } from '../composables/useShowcase'

// Screens of scrolling each project gets while the showcase is pinned.
const SCROLL_PER_PROJECT = 70
const MAX_STACK = 6

const { t } = useI18n()
const { trackClick } = useAnalytics()
const { projects } = useProjects()
const { activeIndex } = useShowcase()

const section = ref<HTMLElement | null>(null)
const height = computed(() => `${projects.value.length * SCROLL_PER_PROJECT + 100}svh`)

// The technologies a project shares with the previous one lead the list and are
// highlighted: they are the words that connect the two projects.
const sharedWithPrevious = computed(() => {
  const i = activeIndex.value
  if (i === 0) return new Set<string>()
  const before = new Set(projects.value[i - 1]?.tags ?? [])
  return new Set((projects.value[i]?.tags ?? []).filter((tag) => before.has(tag)))
})
const stack = computed(() => {
  const tags = projects.value[activeIndex.value]?.tags ?? []
  const shared = tags.filter((tag) => sharedWithPrevious.value.has(tag))
  const rest = tags.filter((tag) => !sharedWithPrevious.value.has(tag))
  return [...shared, ...rest].slice(0, MAX_STACK)
})

const codeLinks = (project: Project) => {
  if (project.githubUrls) return project.githubUrls
  return project.githubUrl ? [{ label: t('caseStudy.code'), url: project.githubUrl }] : []
}

// Which project is pinned follows how far the section has scrolled.
const update = () => {
  const el = section.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const range = rect.height - window.innerHeight
  const progress = range > 0 ? Math.min(Math.max(-rect.top / range, 0), 0.9999) : 0
  activeIndex.value = Math.floor(progress * projects.value.length)
}

onMounted(() => {
  window.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', update)
  update()
})
onUnmounted(() => {
  window.removeEventListener('scroll', update)
  window.removeEventListener('resize', update)
  activeIndex.value = 0
})
watch(projects, update)
</script>

<template>
  <section id="projects" ref="section" class="relative" :style="{ height }" :aria-label="t('projects.title')">
    <div class="sticky top-0 flex h-[100svh] flex-col gap-6 pb-8 pt-24 md:grid md:grid-cols-[1fr_1.2fr] md:items-center md:gap-14 md:pt-20">
      <!-- The StageFrame (App level) is drawn over this slot. -->
      <div id="showcase-slot" class="aspect-[16/10] w-full shrink-0 md:order-2 md:max-h-[68svh]" aria-hidden="true"></div>

      <div class="min-w-0 md:order-1">
        <h2 class="mb-4 text-sm font-medium text-muted md:mb-8">{{ t('projects.title') }}</h2>

        <div class="grid">
          <article
            v-for="(project, index) in projects"
            :key="project.slug"
            class="caption"
            :class="{ 'is-active': index === activeIndex }"
            :aria-hidden="index === activeIndex ? undefined : 'true'"
          >
            <h3 class="text-[clamp(2.25rem,6vw,4.5rem)] font-semibold leading-none text-ink" style="letter-spacing: -0.04em">
              {{ project.title }}
            </h3>
            <p class="mt-4 max-w-[36ch] text-base leading-relaxed text-muted sm:text-lg">{{ project.tagline || project.description }}</p>
          </article>
        </div>

        <TransitionGroup tag="ul" name="word" class="words mt-5" :aria-label="t('caseStudy.stack')">
          <li v-for="word in stack" :key="word" :class="sharedWithPrevious.has(word) ? 'text-accent' : 'text-ink/65'">{{ word }}</li>
        </TransitionGroup>

        <div class="mt-6 grid">
          <div
            v-for="(project, index) in projects"
            :key="project.slug"
            class="caption"
            :class="{ 'is-active': index === activeIndex }"
            :aria-hidden="index === activeIndex ? undefined : 'true'"
          >
              <div class="mt-6 flex flex-wrap items-center gap-2.5">
                <RouterLink
                  :to="`/projetos/${project.slug}`"
                  class="pill-solid"
                  :tabindex="index === activeIndex ? 0 : -1"
                  @click="() => trackClick('click_case_study', { project_title: project.title })"
                >
                  {{ t('projects.caseStudy') }}
                </RouterLink>
                <a
                  v-if="project.liveUrl"
                  :href="project.liveUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="pill-glass"
                  :tabindex="index === activeIndex ? 0 : -1"
                  @click="() => trackClick('click_project_live', { project_title: project.title })"
                >
                  {{ t('buttons.live') }}
                  <ArrowUpRightIcon class="h-3.5 w-3.5" />
                </a>
                <a
                  v-for="link in codeLinks(project)"
                  :key="link.url"
                  :href="link.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="px-2 py-2 text-sm font-medium text-muted transition-colors hover:text-ink"
                  :tabindex="index === activeIndex ? 0 : -1"
                  @click="() => trackClick('click_project_github', { project_title: project.title, link_label: link.label })"
                >
                  {{ link.label }}
                </a>
              </div>
          </div>
        </div>

        <div class="mt-8 flex items-center gap-1.5 md:mt-10" aria-hidden="true">
          <span
            v-for="(project, index) in projects"
            :key="project.slug"
            class="h-1 rounded-full bg-ink transition-all duration-500 ease-out"
            :class="index === activeIndex ? 'w-8 opacity-80' : 'w-2 opacity-20'"
          ></span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Every caption sits in the same grid cell; only the active one is shown. */
.caption {
  grid-area: 1 / 1;
  opacity: 0;
  transform: translateY(24px);
  visibility: hidden;
  pointer-events: none;
  transition:
    opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.6s cubic-bezier(0.22, 1, 0.36, 1),
    visibility 0s 0.5s;
}
.caption.is-active {
  opacity: 1;
  transform: none;
  visibility: visible;
  pointer-events: auto;
  transition-delay: 0.12s, 0.12s, 0s;
}
/* Technology words: shared ones stay put and glide into place, the rest swap. */
.words {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 0.15rem 0.9rem;
  min-height: 3.25rem;
  align-content: flex-start;
  font-size: 0.9375rem;
  font-weight: 500;
}
.words li {
  transition:
    transform 0.7s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.45s ease,
    color 0.5s ease;
}
.word-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.word-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.word-leave-active {
  position: absolute;
}
@media (prefers-reduced-motion: reduce) {
  .words li {
    transition: none;
  }
  .caption,
  .caption.is-active {
    transition: none;
    transform: none;
  }
}
</style>
