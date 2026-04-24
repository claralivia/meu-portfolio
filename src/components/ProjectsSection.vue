<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, ref, onMounted, watch } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
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

const displayProjects = computed(() => {
  if (filteredProjects.value.length >= 3) {
    return [
      ...filteredProjects.value.map(p => ({ ...p, uniqueKey: p.key + '-p2', isClone: true })),
      ...filteredProjects.value.map(p => ({ ...p, uniqueKey: p.key + '-p1', isClone: true })),
      ...filteredProjects.value.map(p => ({ ...p, uniqueKey: p.key + '-curr', isClone: false })),
      ...filteredProjects.value.map(p => ({ ...p, uniqueKey: p.key + '-n1', isClone: true })),
      ...filteredProjects.value.map(p => ({ ...p, uniqueKey: p.key + '-n2', isClone: true }))
    ]
  }
  return filteredProjects.value.map(p => ({ ...p, uniqueKey: p.key + '-curr', isClone: false }))
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

const sectionRef = ref<HTMLElement | null>(null)
const gridRef = ref<any>(null)
const isDragging = ref(false)
const lastX = ref(0)

const onMouseDown = (e: MouseEvent) => {
  const gridEl = gridRef.value?.$el || gridRef.value
  if (!gridEl) return
  isDragging.value = true
  gridEl.classList.add('cursor-grabbing')
  gridEl.classList.remove('snap-x', 'snap-mandatory', 'scroll-smooth')
  lastX.value = e.pageX
}

const onMouseLeave = () => {
  isDragging.value = false
  const gridEl = gridRef.value?.$el || gridRef.value
  if (gridEl) {
    gridEl.classList.remove('cursor-grabbing')
    gridEl.classList.add('snap-x', 'snap-mandatory', 'scroll-smooth')
  }
}

const onMouseUp = () => {
  isDragging.value = false
  const gridEl = gridRef.value?.$el || gridRef.value
  if (gridEl) {
    gridEl.classList.remove('cursor-grabbing')
    gridEl.classList.add('snap-x', 'snap-mandatory', 'scroll-smooth')
  }
}

const onMouseMove = (e: MouseEvent) => {
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

  if (!isDragging.value) return
  e.preventDefault()

  const walk = (e.pageX - lastX.value) * 2
  gridEl.scrollLeft -= walk
  lastX.value = e.pageX
}

let isJumping = false
let scrollTimeout: any = null

const onScroll = () => {
  if (scrollTimeout) clearTimeout(scrollTimeout)
  
  scrollTimeout = setTimeout(() => {
    const len = filteredProjects.value.length
    if (len < 3 || isJumping || isDragging.value) return
    
    const gridEl = gridRef.value?.$el || gridRef.value
    if (!gridEl || gridEl.children.length === 0) return

    const firstSetStart = (gridEl.children[0] as HTMLElement).offsetLeft
    const secondSetStart = (gridEl.children[len] as HTMLElement).offsetLeft
    const W = secondSetStart - firstSetStart

    if (W === 0) return

    const scrollPos = gridEl.scrollLeft

    if (scrollPos < W * 1.5) {
      isJumping = true
      gridEl.classList.remove('scroll-smooth', 'snap-x', 'snap-mandatory')
      gridEl.scrollLeft += W
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (!isDragging.value) gridEl.classList.add('scroll-smooth', 'snap-x', 'snap-mandatory')
        isJumping = false
      }))
    } else if (scrollPos > W * 2.5) {
      isJumping = true
      gridEl.classList.remove('scroll-smooth', 'snap-x', 'snap-mandatory')
      gridEl.scrollLeft -= W
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (!isDragging.value) gridEl.classList.add('scroll-smooth', 'snap-x', 'snap-mandatory')
        isJumping = false
      }))
    }
  }, 150)
}

const centerCarousel = () => {
  const gridEl = gridRef.value?.$el || gridRef.value
  if (!gridEl || gridEl.children.length === 0) return
  
  gridEl.classList.remove('scroll-smooth')
  
  let targetIndex = 0
  const len = filteredProjects.value.length
  if (len >= 3) {
    targetIndex = len * 2 + 1
  } else if (len > 1) {
    targetIndex = 1
  }
  
  if (gridEl.children[targetIndex]) {
    const targetCard = gridEl.children[targetIndex] as HTMLElement
    const scrollPos = targetCard.offsetLeft - gridEl.offsetWidth / 2 + targetCard.offsetWidth / 2
    gridEl.scrollLeft = scrollPos
  }
  
  requestAnimationFrame(() => {
    if (!isDragging.value) gridEl.classList.add('scroll-smooth')
  })
}

const isVisible = ref(false)
const hasAnimated = ref(false)

onMounted(() => {
  setTimeout(centerCarousel, 100)

  useIntersectionObserver(sectionRef, ([{ isIntersecting }]) => {
    if (isIntersecting && !isVisible.value) {
      isVisible.value = true
      setTimeout(() => {
        hasAnimated.value = true
      }, 1000)
    }
  }, { threshold: 0.15 })
})

watch(activeFilter, () => setTimeout(centerCarousel, 100))
</script>

<template>
  <section id="projects" ref="sectionRef" class="py-16 sm:py-24">
    <h2 class="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl mb-12 text-center">
      {{ t('projects.title') }}
    </h2>

    <div class="flex justify-center mb-12">
      <div class="inline-flex flex-wrap justify-center gap-1.5 p-1.5 bg-gradient-to-br from-white/50 to-white/20 dark:from-white/10 dark:to-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-[2rem] shadow-inner shadow-black/5 dark:shadow-black/20">
        <button
          v-for="filter in filters"
          :key="filter"
          class="px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 outline-none"
          :class="activeFilter === filter
            ? 'bg-white/50 dark:bg-white/10 border border-white/40 dark:border-white/10 text-neutral-900 dark:text-white shadow-md shadow-black/5 dark:shadow-black/20'
            : 'border border-transparent text-neutral-600 dark:text-gray-400 hover:bg-white/30 dark:hover:bg-white/5 hover:text-neutral-900 dark:hover:text-white'"
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
      class="flex overflow-x-auto gap-4 sm:gap-8 py-16 md:py-20 px-[calc(50%-37.5vw)] sm:px-[calc(50%-11rem)] md:px-[calc(50%-12rem)] snap-x snap-mandatory hide-scrollbar project-grid scroll-smooth cursor-grab"
      @mousedown="onMouseDown"
      @mouseleave="onMouseLeave"
      @mouseup="onMouseUp"
      @mousemove="onMouseMove"
      @scroll="onScroll"
    >
      <div
        v-for="(project, index) in displayProjects"
        :key="project.uniqueKey"
        :aria-hidden="project.isClone ? 'true' : undefined"
        class="relative card-glass group p-6 sm:p-8 flex flex-col overflow-visible flex-none w-[75vw] sm:w-[22rem] md:w-[24rem] snap-center select-none"
        :class="!isVisible ? 'opacity-0 translate-y-16' : ''"
        :style="!hasAnimated ? { transitionDelay: `${(index % (filteredProjects.length || 1)) * 150}ms` } : {}"
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
                draggable="false"
                class="flex items-center justify-center gap-1.5 text-sm font-medium py-1.5 px-3 rounded-full bg-white/10 border border-white/20 shadow-sm dark:bg-white/5 dark:border-white/10 dark:shadow-black/20 text-neutral-800 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 hover:scale-105"
                @dragstart.prevent
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
                  draggable="false"
                  class="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                  @dragstart.prevent
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
                  draggable="false"
                  class="text-gray-500 dark:text-gray-400 hover:text-neutral-900 dark:hover:text-white transition-colors w-6 h-6"
                  @dragstart.prevent
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
              loading="lazy"
              draggable="false"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03] select-none pointer-events-none"
              @dragstart.prevent
            />
          </div>

          <p class="text-gray-600 dark:text-gray-300 mb-4">
            {{ project.description }}
          </p>

          <div class="flex flex-wrap gap-3">
            <span
              v-for="tag in project.tags"
              :key="tag"
              class="flex items-center gap-2 text-xs font-semibold tracking-wide py-1.5 px-3.5 rounded-full bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 shadow-sm text-neutral-700 dark:text-gray-300 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:bg-white/20 dark:hover:bg-white/10 cursor-default"
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
.project-list-enter-active,
.project-list-leave-active {
  transition: all 0.4s ease;
}
.project-list-enter-from,
.project-list-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
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
