<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, ref } from 'vue'
import GithubIcon from './icons/GithubIcon.vue'
import { ArrowTopRightOnSquareIcon } from '@heroicons/vue/24/outline'
import TechIcon from './icons/TechIcon.vue'
import { useAnalytics } from '../composables/useAnalytics'

interface Project {
  title: string
  description: string
  tags: string[]
  githubUrl?: string
  githubUrls?: { label: string; url: string }[]
  liveUrl?: string
  category: string
  key: string
}

const { t, tm } = useI18n()
const { trackClick } = useAnalytics()

const filters = ['all', 'frontend', 'fullstack']
const activeFilter = ref('all')

const projects = computed((): Project[] => {
  return (tm('projects.items') as Project[]) || []
})

const filteredProjects = computed(() => {
  if (activeFilter.value === 'all') return projects.value
  return projects.value.filter(p => p.category === activeFilter.value)
})

function getColorAnimation(index: number): string {
  const colorClasses: string[] = [
    'bg-blue-300/30 dark:bg-blue-600/30',
    'bg-pink-300/30 dark:bg-pink-600/30',
    'bg-green-300/30 dark:bg-green-600/30',
    'bg-amber-300/30 dark:bg-amber-600/30',
  ]

  const positionClasses: string[] = [
    'top-1/3 -left-20',
    'top-2/3 -right-20',
    'bottom-0 -left-10',
    'bottom-1/4 right-1/4',
  ]

  const i = index % colorClasses.length
  return `${colorClasses[i]} ${positionClasses[i]} animate-blob`
}

function getDemoImage(key: string): string {
  try {
    return new URL(`../assets/${key}.png`, import.meta.url).href
  } catch {
    return new URL('../assets/project-placeholder.jpg', import.meta.url).href
  }
}

const gridRef = ref<any>(null)

const handleMouseMove = (e: MouseEvent) => {
  const gridEl = gridRef.value?.$el || gridRef.value
  if (!gridEl) return
  for (const card of gridEl.children) {
    const htmlCard = card as HTMLElement
    const rect = htmlCard.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    htmlCard.style.setProperty('--mouse-x', `${x}px`)
    htmlCard.style.setProperty('--mouse-y', `${y}px`)
  }
}
</script>

<template>
  <section id="projects" class="py-16 sm:py-24">
    <h2 class="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl mb-12 text-center">
      {{ t('projects.title') }}
    </h2>

    <div class="flex justify-center mb-12">
      <div class="inline-flex flex-wrap justify-center gap-1.5 p-1.5 bg-white/40 dark:bg-neutral-800/40 backdrop-blur-xl border border-white/50 dark:border-neutral-700/50 rounded-[2rem] shadow-inner shadow-black/5 dark:shadow-black/20">
        <button
          v-for="filter in filters"
          :key="filter"
          class="px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 outline-none"
          :class="activeFilter === filter
            ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-md shadow-black/5'
            : 'text-neutral-600 dark:text-gray-400 hover:text-neutral-900 dark:hover:text-white'"
          @click="activeFilter = filter"
        >
          {{ t(`projects.filters.${filter}`) }}
        </button>
      </div>
    </div>

    <transition-group
      ref="gridRef"
      name="project-list"
      tag="div"
      class="grid grid-cols-1 md:grid-cols-2 gap-8 project-grid"
      @mousemove="handleMouseMove"
    >
      <div
        v-for="(project, index) in filteredProjects"
        :key="project.title"
        class="relative card-glass group p-8 rounded-[2rem] flex flex-col overflow-visible transition-all duration-500 border backdrop-blur-2xl bg-white/40 dark:bg-neutral-800/40 border-white/50 dark:border-neutral-700/50 shadow-xl shadow-black/5 dark:shadow-black/20 hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-black/30 hover:-translate-y-1"
      >
        <div
          :class="getColorAnimation(index)"
          class="absolute w-64 h-64 rounded-full blur-3xl -z-10 transition-all duration-500 mix-blend-soft-light"
          :style="{ animationDelay: `${index * 1.2}s` }"
        ></div>

        <div class="relative z-10 flex flex-col h-full">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold text-neutral-900 dark:text-white">
              {{ project.title }}
            </h3>
            <div class="flex items-center gap-3">
              <a
                v-if="project.liveUrl"
                :href="project.liveUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center justify-center gap-1.5 text-sm font-medium py-1.5 px-3 rounded-full bg-white/30 border border-white/20 backdrop-blur-md shadow-sm dark:bg-white/5 dark:border-white/10 dark:shadow-black/20 text-neutral-800 dark:text-gray-200 hover:bg-white/50 dark:hover:bg-white/10 transition-all duration-300 hover:scale-105"
                @click="() => trackClick('click_project_live', { project_title: project.title })"
              >
                <span class="leading-none pt-[1px]">{{ t('buttons.live') }}</span>
                <ArrowTopRightOnSquareIcon class="w-4 h-4" />
              </a>

              <div v-if="project.liveUrl && (project.githubUrls || project.githubUrl)" class="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>

              <template v-if="project.githubUrls">
                <a
                  v-for="link in project.githubUrls"
                  :key="link.url"
                  :href="link.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                  @click="() => trackClick('click_project_github', { project_title: project.title, link_label: link.label })"
                >
                  <span>{{ link.label }}</span>
                  <div class="w-5 h-5"><GithubIcon /></div>
                </a>
              </template>
              <template v-else-if="project.githubUrl">
                <a
                  :href="project.githubUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-gray-500 dark:text-gray-400 hover:text-neutral-900 dark:hover:text-white transition-colors w-6 h-6"
                  @click="() => trackClick('click_project_github', { project_title: project.title })"
                >
                  <GithubIcon />
                </a>
              </template>
            </div>
          </div>

          <div
            class="mb-4 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 aspect-w-16 aspect-h-9 group relative"
          >
            <img
              :src="getDemoImage(project.key)"
              :alt="`Demo do projeto ${project.title}`"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>

          <p class="text-gray-600 dark:text-gray-300 mb-4">
            {{ project.description }}
          </p>

          <div class="flex flex-wrap gap-3">
            <span
              v-for="tag in project.tags"
              :key="tag"
              class="flex items-center gap-2 text-xs font-semibold tracking-wide py-1.5 px-3.5 rounded-full bg-white/50 border border-white/60 backdrop-blur-md shadow-sm dark:bg-neutral-700/50 dark:border-neutral-600/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              <TechIcon :name="tag" />
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </transition-group>
  </section>
</template>

<style scoped>
.card-glass:hover {
  backdrop-filter: blur(24px) saturate(160%);
}

.project-list-enter-active,
.project-list-leave-active {
  transition: all 0.4s ease;
}
.project-list-enter-from,
.project-list-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.card-glass::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(
    600px circle at var(--mouse-x, 0) var(--mouse-y, 0),
    rgba(255, 255, 255, 0.4),
    transparent 40%
  );
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
  z-index: 0;
}
:global(.dark) .card-glass::before {
  background: radial-gradient(
    600px circle at var(--mouse-x, 0) var(--mouse-y, 0),
    rgba(255, 255, 255, 0.08),
    transparent 40%
  );
}
@media (hover: hover) {
  .project-grid:hover .card-glass::before {
    opacity: 1;
  }
}
</style>
