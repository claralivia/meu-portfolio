<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowRightIcon, PlusIcon } from '@heroicons/vue/24/outline'
import BackLink from '../components/BackLink.vue'
import { usePageMeta } from '../composables/usePageMeta'
import profilePicture from '../assets/minha-foto.webp'

interface Item {
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

const items = computed(() => (tm('aboutPage.items') as Item[]) || [])
const degrees = computed(() => (tm('education.degrees') as Degree[]) || [])
const certifications = computed(() => (tm('education.certifications') as Certification[]) || [])
const skills = computed(() => (tm('skills.categories') as SkillCategory[]) || [])

// One line open at a time: the page stays short until you ask for more.
const open = ref(-1)
const toggle = (i: number) => (open.value = open.value === i ? -1 : i)
const archive = ref(false)

// The photo leans toward the pointer.
const card = ref<HTMLElement | null>(null)
const lean = (e: PointerEvent) => {
  const el = card.value
  if (!el || e.pointerType !== 'mouse') return
  const r = el.getBoundingClientRect()
  el.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 16}deg`)
  el.style.setProperty('--rx', `${-((e.clientY - r.top) / r.height - 0.5) * 16}deg`)
}
const settle = () => {
  card.value?.style.setProperty('--ry', '0deg')
  card.value?.style.setProperty('--rx', '0deg')
}

usePageMeta(() => ({
  title: `${t('aboutPage.title')} | Clara Lívia`,
  description: t('aboutPage.lead'),
  path: '/sobre',
}))
</script>

<template>
  <article class="pb-20 pt-24 sm:pt-28">
    <BackLink to="/" :label="t('aboutPage.back')" />

    <div class="grid items-center gap-10 md:grid-cols-[1fr_1.1fr] md:gap-20">
      <div class="stage" @pointermove="lean" @pointerleave="settle">
        <div ref="card" class="card">
          <img :src="profilePicture" alt="Foto de Clara Lívia" width="512" height="512" />
        </div>
        <p class="mt-3 text-sm text-muted">{{ t('aboutPage.photoCaption') }}</p>
      </div>

      <div>
        <h1 class="text-sm font-medium text-muted">{{ t('aboutPage.title') }}</h1>
        <p class="mt-3 font-display font-extrabold text-ink" style="font-size: clamp(2.6rem, 6.2vw, 4.8rem); line-height: 0.98; letter-spacing: -0.05em">
          {{ t('aboutPage.openOne') }}
        </p>

        <ul class="lines mt-8">
          <li v-for="(item, i) in items" :key="item.title">
            <button type="button" class="line" :aria-expanded="open === i" @click="toggle(i)">
              <span class="n">{{ String(i + 1).padStart(2, '0') }}</span>
              <span class="t">{{ item.title }}</span>
              <PlusIcon class="plus h-5 w-5" :class="{ 'is-open': open === i }" aria-hidden="true" />
            </button>
            <div class="answer" :class="{ 'is-open': open === i }">
              <p>{{ item.text }}</p>
            </div>
          </li>
        </ul>

        <RouterLink to="/#experience" class="more mt-8">
          {{ t('aboutPage.journeyLink') }}
          <ArrowRightIcon class="h-4 w-4" aria-hidden="true" />
        </RouterLink>
      </div>
    </div>

    <!-- Everything else is kept in a drawer. -->
    <section class="mt-20 sm:mt-28">
      <button type="button" class="archive" :aria-expanded="archive" @click="archive = !archive">
        <span class="font-display text-2xl font-bold text-ink sm:text-3xl" style="letter-spacing: -0.035em">{{ t('aboutPage.archive') }}</span>
        <span class="text-sm text-muted">{{ t('aboutPage.archiveHint') }}</span>
        <PlusIcon class="plus ml-auto h-6 w-6" :class="{ 'is-open': archive }" aria-hidden="true" />
      </button>
      <div class="answer" :class="{ 'is-open': archive }">
        <dl class="rows">
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
      </div>
    </section>

    <p v-reveal class="mt-20 max-w-[28ch] font-display text-3xl font-bold text-ink sm:mt-28 sm:text-4xl" style="letter-spacing: -0.03em; text-wrap: balance">
      {{ t('aboutPage.closing') }}
      <RouterLink to="/#contact" class="closing">{{ t('aboutPage.closingLink') }}</RouterLink>
    </p>
  </article>
</template>

<style scoped>
.stage {
  max-width: 26rem;
  perspective: 1100px;
}
.card {
  transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
.card img {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 5;
  border-radius: 1.25rem;
  object-fit: cover;
  object-position: top;
}

.lines {
  border-top: 1px solid var(--line);
}
.lines li {
  border-bottom: 1px solid var(--line);
}
.line,
.archive {
  display: flex;
  width: 100%;
  align-items: baseline;
  gap: 1rem;
  padding: 1.05rem 0;
  text-align: left;
}
.n {
  width: 1.6rem;
  font-size: 0.8rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: rgb(var(--muted));
}
.t {
  flex: 1;
  font-family: theme('fontFamily.display');
  font-size: clamp(1.25rem, 2.4vw, 1.6rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  color: rgb(var(--ink));
}
.plus {
  align-self: center;
  flex-shrink: 0;
  color: rgb(var(--muted));
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.plus.is-open {
  transform: rotate(45deg);
  color: rgb(var(--accent));
}
.archive {
  align-items: center;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  padding: 1.5rem 0;
}

/* The answer slides open: the row grows from 0 to its own height. */
.answer {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition:
    grid-template-rows 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.35s ease;
}
.answer.is-open {
  grid-template-rows: 1fr;
  opacity: 1;
}
.answer > * {
  min-height: 0;
  overflow: hidden;
}
.lines .answer p {
  padding: 0 2.6rem 1.2rem;
  max-width: 52ch;
  color: rgb(var(--muted));
}

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
  padding-top: 0.5rem;
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

@media (prefers-reduced-motion: reduce) {
  .card,
  .plus,
  .answer {
    transition: none;
  }
}
</style>
