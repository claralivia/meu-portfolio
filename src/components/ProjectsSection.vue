<script setup lang="ts">
import { computed, ref } from 'vue'
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
</script>

<template>
  <section id="projects" class="py-20 md:py-28">
    <h2 v-reveal class="section-title">{{ t('projects.title') }}</h2>

    <div v-reveal class="mt-7 flex flex-wrap items-center gap-2" role="group" :aria-label="t('projects.filterLabel')">
      <span class="mr-1 text-sm text-muted">{{ t('projects.filterLabel') }}</span>
      <button type="button" class="chip" :aria-pressed="!tech" @click="tech = ''">{{ t('projects.filters.all') }}</button>
      <button v-for="name in techs" :key="name" type="button" class="chip" :aria-pressed="tech === name" @click="pick(name)">{{ name }}</button>
    </div>

    <div class="mt-10 grid gap-10 md:grid-cols-[1.1fr_1fr] md:gap-14">
      <TransitionGroup tag="ul" name="proj" class="list relative">
        <li v-for="p in visible" :key="p.slug" class="item" @mouseenter="hover = p.slug" @focusin="hover = p.slug">
          <RouterLink :to="`/projetos/${p.slug}`" class="row" @click="() => trackClick('click_case_study', { project_title: p.title })">
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
