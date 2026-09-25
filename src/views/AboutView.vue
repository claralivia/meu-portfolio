<script setup lang="ts">
import { computed, h, type Component } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ArrowRightIcon,
  MapPinIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  LightBulbIcon,
  PauseIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  FlagIcon,
  BookOpenIcon,
  SunIcon,
  HomeIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/vue/24/outline'
import IconTile, { type TileColor } from '../components/IconTile.vue'
import BackLink from '../components/BackLink.vue'
import LifeIcon from '../components/icons/LifeIcon.vue'
import { usePageMeta } from '../composables/usePageMeta'
import { useAnalytics } from '../composables/useAnalytics'
import profilePicture from '../assets/minha-foto.webp'

type JourneyType = 'education' | 'work' | 'volunteer' | 'paused'

interface JourneyStep {
  period: string
  title: string
  place: string
  note?: string
  type: JourneyType
  current?: boolean
}
interface IconCard {
  icon: string
  title: string
  text: string
}

const { t, tm } = useI18n()
const { trackClick } = useAnalytics()

const traits = computed(() => (tm('aboutPage.traits') as string[]) || [])
const journey = computed(() => (tm('aboutPage.journey') as JourneyStep[]) || [])
const how = computed(() => (tm('aboutPage.how') as IconCard[]) || [])
const hobbies = computed(() => (tm('aboutPage.hobbies') as IconCard[]) || [])

const life = (name: 'games' | 'coffee' | 'pets'): Component => () => h(LifeIcon, { name })

// Content only names an icon; the look (glyph + color) is decided here.
const icons: Record<string, { icon: Component; color: TileColor }> = {
  education: { icon: AcademicCapIcon, color: 'purple' },
  work: { icon: BriefcaseIcon, color: 'blue' },
  volunteer: { icon: LightBulbIcon, color: 'amber' },
  paused: { icon: PauseIcon, color: 'slate' },
  solve: { icon: WrenchScrewdriverIcon, color: 'blue' },
  help: { icon: UserGroupIcon, color: 'pink' },
  focus: { icon: FlagIcon, color: 'emerald' },
  games: { icon: life('games'), color: 'purple' },
  coffee: { icon: life('coffee'), color: 'amber' },
  beach: { icon: SunIcon, color: 'orange' },
  pets: { icon: life('pets'), color: 'pink' },
  family: { icon: HomeIcon, color: 'rose' },
  study: { icon: BookOpenIcon, color: 'sky' },
}
const iconFor = (key: string) => icons[key] ?? icons.study

const traitColors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-emerald-500']

usePageMeta(() => ({
  title: `${t('aboutPage.title')} | Clara Lívia`,
  description: t('aboutPage.lead'),
  path: '/sobre',
}))
</script>

<template>
  <article class="py-10 sm:py-16">
    <BackLink to="/" :label="t('aboutPage.back')" />

    <!-- Intro + highlight -->
    <div class="grid md:grid-cols-3 gap-6 mb-6">
      <header v-reveal class="card-glass md:col-span-2 p-6 sm:p-8">
        <div class="relative z-10">
          <div class="flex items-center gap-5 mb-6">
            <img
              :src="profilePicture"
              alt="Foto de Clara Lívia"
              width="512"
              height="512"
              class="w-20 h-20 sm:w-24 sm:h-24 rounded-[28%] object-cover shadow-lg shadow-black/10 border-[3px] border-white/70 dark:border-white/15"
            />
            <div class="min-w-0">
              <p class="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">{{ t('aboutPage.title') }}</p>
              <h1 class="mt-0.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">Clara Lívia</h1>
              <p class="mt-1 text-sm text-neutral-600 dark:text-gray-400">
                {{ t('about.role') }} <span class="mx-1 text-neutral-400" aria-hidden="true">·</span>
                <span class="font-semibold text-neutral-800 dark:text-gray-200">{{ t('about.company') }}</span>
              </p>
              <p class="mt-0.5 inline-flex items-center gap-1 text-sm text-neutral-500 dark:text-gray-400">
                <MapPinIcon class="w-4 h-4" />
                {{ t('about.location') }}
              </p>
            </div>
          </div>

          <p class="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">{{ t('aboutPage.lead') }}</p>

          <ul class="flex flex-wrap gap-2.5">
            <li v-for="(trait, index) in traits" :key="trait" class="tech-chip !text-sm !py-2">
              <span class="w-2 h-2 rounded-full" :class="traitColors[index % traitColors.length]"></span>
              {{ trait }}
            </li>
          </ul>
        </div>
      </header>

      <div v-reveal="120" class="highlight relative overflow-hidden rounded-[2rem] p-6 sm:p-8 text-white shadow-xl shadow-purple-500/20 flex flex-col justify-between min-h-[14rem]">
        <div class="relative z-10">
          <p class="text-6xl font-extrabold tracking-tighter leading-none">{{ t('aboutPage.stat.value') }}</p>
          <p class="mt-2 text-lg font-semibold text-white/90">{{ t('aboutPage.stat.label') }}</p>
        </div>
        <p class="relative z-10 mt-6 inline-flex items-center gap-2 self-start rounded-full bg-white/20 px-3.5 py-1.5 text-sm font-semibold ring-1 ring-inset ring-white/30">
          <span class="relative flex h-2.5 w-2.5">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60"></span>
            <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-white"></span>
          </span>
          {{ t('about.available') }}
        </p>
      </div>
    </div>

    <!-- How I work -->
    <div class="grid md:grid-cols-3 gap-6 mb-6">
      <div v-for="(card, index) in how" :key="card.title" v-reveal="index * 120" class="card-glass p-6 sm:p-7">
        <div class="relative z-10">
          <IconTile :icon="iconFor(card.icon).icon" :color="iconFor(card.icon).color" class="mb-4" />
          <h2 class="text-lg font-bold text-neutral-900 dark:text-white mb-1.5">{{ card.title }}</h2>
          <p class="text-gray-600 dark:text-gray-300 leading-relaxed">{{ card.text }}</p>
        </div>
      </div>
    </div>

    <!-- Journey + now/contact -->
    <div class="grid md:grid-cols-3 gap-6 mb-6">
      <section v-reveal class="card-glass md:col-span-2 p-6 sm:p-8">
        <div class="relative z-10">
          <h2 class="text-2xl font-bold text-neutral-900 dark:text-white mb-6">{{ t('aboutPage.journeyTitle') }}</h2>
          <ol class="relative">
            <li v-for="(step, index) in journey" :key="step.title" class="relative flex gap-4 pb-6 last:pb-0">
              <span
                v-if="index < journey.length - 1"
                class="absolute left-4 top-9 bottom-0 w-px -translate-x-1/2 bg-gradient-to-b from-neutral-300 to-neutral-200 dark:from-neutral-600 dark:to-neutral-700"
                aria-hidden="true"
              ></span>
              <IconTile
                :icon="iconFor(step.type).icon"
                :color="step.current ? 'emerald' : iconFor(step.type).color"
                size="sm"
                class="relative mt-0.5"
                :class="step.current ? 'ring-4 ring-emerald-400/30' : ''"
              />
              <div class="min-w-0">
                <p class="text-xs font-semibold uppercase tracking-wider" :class="step.current ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-500 dark:text-gray-400'">
                  {{ step.period }}
                </p>
                <p class="mt-0.5 font-bold text-neutral-900 dark:text-white leading-snug">{{ step.title }}</p>
                <p class="text-sm text-neutral-600 dark:text-gray-400">{{ step.place }}</p>
                <p v-if="step.note" class="mt-1 inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-neutral-900/5 dark:bg-white/10 text-neutral-600 dark:text-gray-400">
                  {{ step.note }}
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <div class="flex flex-col gap-6">
        <section v-reveal="120" class="card-glass p-6 sm:p-7">
          <div class="relative z-10">
            <IconTile :icon="BookOpenIcon" color="orange" class="mb-4" />
            <h2 class="text-lg font-bold text-neutral-900 dark:text-white mb-1.5">{{ t('aboutPage.nowTitle') }}</h2>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">{{ t('aboutPage.now') }}</p>
          </div>
        </section>

        <section v-reveal="200" class="card-glass p-6 sm:p-7 flex-1">
          <div class="relative z-10 flex flex-col h-full">
            <IconTile :icon="ChatBubbleLeftRightIcon" color="emerald" class="mb-4" />
            <h2 class="text-lg font-bold text-neutral-900 dark:text-white mb-1.5">{{ t('contact.title') }}</h2>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed mb-5">{{ t('aboutPage.ctaText') }}</p>
            <RouterLink
              to="/#contact"
              class="group mt-auto flex w-full items-center justify-center gap-2 whitespace-nowrap font-medium py-2.5 px-5 rounded-2xl bg-gradient-to-br from-white/50 to-white/20 dark:from-white/10 dark:to-white/5 border border-white/50 dark:border-white/10 shadow-lg shadow-black/5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 text-neutral-900 dark:text-white"
              @click="() => trackClick('click_about_contact')"
            >
              {{ t('aboutPage.ctaButton') }}
              <ArrowRightIcon class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </RouterLink>
          </div>
        </section>
      </div>
    </div>

    <!-- Outside of code -->
    <section>
      <h2 v-reveal class="text-2xl font-bold text-neutral-900 dark:text-white mt-12 mb-6 px-1">{{ t('aboutPage.hobbiesTitle') }}</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <div
          v-for="(hobby, index) in hobbies"
          :key="hobby.title"
          v-reveal="(index % 3) * 100"
          class="card-glass group p-5 sm:p-6"
        >
          <div class="relative z-10">
            <IconTile
              :icon="iconFor(hobby.icon).icon"
              :color="iconFor(hobby.icon).color"
              size="lg"
              class="mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6"
            />
            <p class="font-bold text-neutral-900 dark:text-white">{{ hobby.title }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ hobby.text }}</p>
          </div>
        </div>
      </div>
    </section>
  </article>
</template>

<style scoped>
/* The one solid block of color on the page, in the site's gradient. */
.highlight {
  background:
    radial-gradient(circle at 85% 15%, rgba(255, 255, 255, 0.35), transparent 45%),
    linear-gradient(135deg, #3b82f6 0%, #8b5cf6 55%, #10b981 100%);
}
.highlight::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5);
  pointer-events: none;
}
</style>
