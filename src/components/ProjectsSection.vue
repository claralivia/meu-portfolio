<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowUpRightIcon } from '@heroicons/vue/24/outline'
import { useProjects } from '../composables/useProjects'
import { useAnalytics } from '../composables/useAnalytics'

const { t } = useI18n()
const { projects } = useProjects()
const { trackClick } = useAnalytics()

const images = import.meta.glob<string>('../assets/*.webp', { eager: true, import: 'default' })
const imageFor = (key: string) => images[`../assets/${key}.webp`]

// The technologies used by more than one project become filters.
const techs = computed(() => {
  const count = new Map<string, number>()
  for (const p of projects.value) for (const tag of p.tags) count.set(tag, (count.get(tag) ?? 0) + 1)
  return [...count.entries()]
    .filter(([, n]) => n > 1)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 7)
    .map(([name]) => name)
})

const tech = ref('')
const visible = computed(() => (tech.value ? projects.value.filter((p) => p.tags.includes(tech.value)) : projects.value))
const pick = (name: string) => {
  tech.value = tech.value === name ? '' : name
  if (tech.value) trackClick('filter_projects', { tech: name })
}

// On wide screens the picture beside the list follows the row you point at.
const hover = ref('')
const shown = computed(() => (visible.value.some((p) => p.slug === hover.value) ? hover.value : visible.value[0]?.slug))

// On a phone the list is a row you swipe through, with a counter under it.
const place = ref(0)
const onScroll = (e: Event) => {
  const el = e.currentTarget as HTMLElement
  const room = el.scrollWidth - el.clientWidth
  place.value = room > 0 ? Math.round((el.scrollLeft / room) * (visible.value.length - 1)) : 0
}
const pad = (n: number) => String(n).padStart(2, '0')
watch(tech, () => (place.value = 0))

// Name the picture that was pressed so the case study page can grow it into place.
const pressed = (e: MouseEvent, title: string) => {
  trackClick('click_case_study', { project_title: title })
  const row = e.currentTarget as HTMLElement
  const wide = window.matchMedia('(min-width: 768px)').matches
  const img = wide ? document.querySelector<HTMLElement>('.shot.on') : row.querySelector<HTMLElement>('.thumb')
  if (img) img.style.viewTransitionName = 'project-shot'
}
</script>

<template>
  <section id="projects" class="py-20 md:py-28">
    <h2 v-reveal class="section-title">{{ t('projects.title') }}</h2>

    <div v-reveal class="filters -mx-6 mt-7 flex items-center gap-2 overflow-x-auto px-6 md:mx-0 md:flex-wrap md:overflow-visible md:px-0" role="group" :aria-label="t('projects.filterLabel')">
      <span class="mr-1 shrink-0 text-sm text-muted">{{ t('projects.filterLabel') }}</span>
      <button type="button" class="chip shrink-0 whitespace-nowrap" :aria-pressed="!tech" @click="tech = ''">{{ t('projects.filters.all') }}</button>
      <button v-for="name in techs" :key="name" type="button" class="chip shrink-0 whitespace-nowrap" :aria-pressed="tech === name" @click="pick(name)">{{ name }}</button>
    </div>

    <div class="mt-10 grid gap-10 md:grid-cols-[1.1fr_1fr] md:gap-14">
      <div class="min-w-0">
      <TransitionGroup tag="ul" name="proj" class="list relative" @scroll.passive="onScroll">
        <li v-for="p in visible" :key="p.slug" class="item" @mouseenter="hover = p.slug" @focusin="hover = p.slug">
          <RouterLink :to="`/projetos/${p.slug}`" class="row" @click="(e: MouseEvent) => pressed(e, p.title)">
            <img class="thumb md:hidden" :src="imageFor(p.key)" :alt="`Demo do projeto ${p.title}`" width="960" height="540" loading="lazy" decoding="async" />
            <span class="flex items-start justify-between gap-4">
              <span class="row-title">{{ p.title }}</span>
              <ArrowUpRightIcon class="row-arrow" aria-hidden="true" />
            </span>
            <span class="row-text">{{ p.tagline || p.description }}</span>
            <span class="row-tags">{{ p.tags.slice(0, 3).join(' · ') }}</span>
          </RouterLink>
        </li>
      </TransitionGroup>
      <p v-if="visible.length > 1" class="pager md:hidden" aria-hidden="true">
        <span class="text-ink">{{ pad(place + 1) }}</span> / {{ pad(visible.length) }}
        <span class="ml-3">{{ t('projects.swipe') }} →</span>
      </p>
      </div>

      <div class="preview hidden md:block" aria-hidden="true">
        <div class="frame">
          <img
            v-for="p in projects"
            :key="p.slug"
            class="shot"
            :class="{ on: p.slug === shown }"
            :src="imageFor(p.key)"
            alt=""
            width="960"
            height="540"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </div>

    <p v-if="!visible.length" class="mt-6 text-muted">{{ t('projects.empty') }}</p>
  </section>
</template>

<style scoped>
.filters {
  scrollbar-width: none;
}
.filters::-webkit-scrollbar {
  display: none;
}
.list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.item {
  border-top: 1px solid var(--line);
}
.item:last-child {
  border-bottom: 1px solid var(--line);
}
.row {
  display: block;
  padding: 1.6rem 0;
}
.thumb {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 10;
  margin-bottom: 1.1rem;
  border-radius: 0.9rem;
  border: 1px solid var(--line);
  object-fit: cover;
  object-position: top;
}
@media (min-width: 768px) {
  .thumb {
    display: none;
  }
}
.row-title {
  font-family: theme('fontFamily.display');
  font-size: clamp(1.6rem, 3.6vw, 2.2rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.03em;
  color: rgb(var(--ink));
}
.row-arrow {
  width: 1.25rem;
  height: 1.25rem;
  margin-top: 0.35rem;
  flex-shrink: 0;
  color: rgb(var(--muted));
  transition:
    transform 0.25s ease,
    color 0.25s ease;
}
.row-text {
  display: block;
  margin-top: 0.5rem;
  max-width: 40ch;
  color: rgb(var(--muted));
}
.row-tags {
  display: block;
  margin-top: 0.6rem;
  font-size: 0.85rem;
  color: rgb(var(--muted) / 0.85);
}

/* Phone: one project at a time, in a row you swipe. The next one peeks in, and each card
   leans back a little as it leaves the middle (scroll-driven, so it costs nothing in script). */
@media (max-width: 767px) {
  .list {
    display: flex;
    gap: 0.8rem;
    margin: 0 -1.5rem;
    padding: 0 11vw 0.25rem;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
  }
  .list::-webkit-scrollbar {
    display: none;
  }
  .item,
  .item:last-child {
    flex: 0 0 78vw;
    scroll-snap-align: center;
    border: 1px solid var(--line);
    border-radius: 1.1rem;
    background: rgb(var(--ink) / 0.035);
  }
  .row {
    padding: 0.7rem 0.7rem 1.1rem;
  }
  .thumb {
    margin-bottom: 0.9rem;
    border-radius: 0.8rem;
  }
  .row-title,
  .row-text,
  .row-tags {
    padding-inline: 0.3rem;
  }
  .row-title {
    font-size: 1.5rem;
  }
  .row-text {
    font-size: 0.95rem;
  }
  .proj-leave-active {
    position: static;
    width: auto;
  }
}
@supports (animation-timeline: view(inline)) {
  @media (max-width: 767px) and (prefers-reduced-motion: no-preference) {
    .item {
      animation: depth linear both;
      animation-timeline: view(inline);
    }
    @keyframes depth {
      0% {
        opacity: 0.55;
        transform: perspective(900px) rotateY(16deg) scale(0.92);
      }
      50% {
        opacity: 1;
        transform: none;
      }
      100% {
        opacity: 0.55;
        transform: perspective(900px) rotateY(-16deg) scale(0.92);
      }
    }
  }
}
.pager {
  margin-top: 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: rgb(var(--muted));
}

/* Pointing at a row dims the others a little (only where there is a pointer). */
@media (hover: hover) {
  .list:hover .item {
    opacity: 0.5;
    transition: opacity 0.25s ease;
  }
  .list:hover .item:hover {
    opacity: 1;
  }
  .row:hover .row-arrow {
    color: rgb(var(--accent));
    transform: translate(3px, -3px);
  }
}

/* The picture that follows the list: stacked, only opacity changes. */
.preview {
  position: sticky;
  top: 6rem;
  align-self: start;
}
.frame {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border-radius: 1rem;
  border: 1px solid var(--line);
  background: rgb(var(--ink) / 0.04);
}
.shot {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  opacity: 0;
  transition: opacity 0.35s ease;
}
.shot.on {
  opacity: 1;
}

/* Filtering: rows that stay slide into place, the others fade. */
.proj-move {
  transition: transform 0.35s ease;
}
.proj-enter-active {
  transition: opacity 0.3s ease 0.1s;
}
.proj-leave-active {
  position: absolute;
  width: 100%;
  transition: opacity 0.2s ease;
}
.proj-enter-from,
.proj-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .proj-move,
  .proj-enter-active,
  .proj-leave-active,
  .shot {
    transition: none;
  }
}
</style>
