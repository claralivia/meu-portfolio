<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import HobbyIcon from './icons/HobbyIcon.vue'
import { ArrowRightIcon } from '@heroicons/vue/24/outline'
import { useAnalytics } from '../composables/useAnalytics'
import profilePicture from '../assets/minha-foto.webp'

interface Hobby {
  icon: string
  title: string
  text: string
}

const { t, tm, locale } = useI18n()
const { trackClick } = useAnalytics()

// The tags are things she likes. Pressing one shows her own line about it.
const hobbies = computed(() => (tm('aboutPage.hobbies') as Hobby[]) || [])
const open = ref(-1)
const toggle = (i: number) => {
  open.value = open.value === i ? -1 : i
  if (open.value >= 0) trackClick('open_hobby', { hobby: hobbies.value[i]?.title })
}

// The portrait answers when pressed: a few short greetings, in turn.
const bubbles = computed(() => (tm('about.bubbles') as string[]) || [])
const bubble = ref('')
let bubbleIndex = 0
let bubbleTimer = 0
const greet = () => {
  bubble.value = bubbles.value[bubbleIndex % bubbles.value.length] ?? ''
  bubbleIndex++
  window.clearTimeout(bubbleTimer)
  bubbleTimer = window.setTimeout(() => (bubble.value = ''), 1800)
}

// What time is it where Clara is?
const clock = ref('')
let clockTimer = 0
const tick = () => {
  clock.value = new Intl.DateTimeFormat(locale.value === 'en' ? 'en-GB' : 'pt-BR', {
    timeZone: 'America/Fortaleza',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date())
}
onMounted(() => {
  tick()
  clockTimer = window.setInterval(tick, 30000)
})
onBeforeUnmount(() => {
  window.clearInterval(clockTimer)
  window.clearTimeout(bubbleTimer)
})
</script>

<template>
  <section id="about" class="pb-20 pt-28 md:pb-28 md:pt-40">
    <div class="grid items-end gap-8 md:grid-cols-[1.45fr_1fr] md:gap-16">
      <div class="order-2 md:order-1">
        <p class="rise text-[15px] text-muted">{{ t('about.role') }} · {{ t('about.company') }}</p>

        <h1
          class="rise mt-5 font-display font-bold text-ink"
          style="--d: 80ms; font-size: clamp(2.9rem, 8.4vw, 5.8rem); line-height: 0.98; letter-spacing: -0.04em; text-wrap: balance"
        >
          {{ t('about.greeting') }} {{ t('about.greetingName') }}
        </h1>

        <p class="rise mt-6 max-w-[34ch] text-lg text-muted" style="--d: 160ms">{{ t('about.intro') }}</p>

        <div class="rise mt-8 flex flex-wrap items-center gap-x-6 gap-y-3" style="--d: 240ms">
          <RouterLink to="/#projects" class="pill-solid" @click="() => trackClick('click_hero_projects')">{{ t('about.cta') }}</RouterLink>
          <RouterLink to="/sobre" class="more" @click="() => trackClick('click_about_page', { section: 'hero' })">
            {{ t('about.curious') }}
            <ArrowRightIcon class="h-4 w-4" aria-hidden="true" />
          </RouterLink>
        </div>

        <div class="rise mt-12" style="--d: 320ms">
          <p class="text-sm text-muted">{{ t('about.tapHint') }}</p>
          <div class="mt-3 flex flex-wrap gap-2" role="group" :aria-label="t('aboutPage.hobbiesTitle')">
            <button v-for="(h, i) in hobbies" :key="h.title" type="button" class="chip" :aria-pressed="open === i" @click="toggle(i)">
              <HobbyIcon :name="h.icon" class="h-4 w-4" />
              {{ h.title }}
            </button>
          </div>
          <Transition name="story" mode="out-in">
            <p :key="open" class="story mt-4" aria-live="polite">
              <template v-if="open >= 0">
                <strong class="font-semibold text-ink">{{ hobbies[open]?.title }}.</strong> {{ hobbies[open]?.text }}
              </template>
            </p>
          </Transition>
        </div>
      </div>

      <div class="rise order-1 flex items-center gap-4 md:order-2 md:block" style="--d: 120ms">
        <button type="button" class="portrait" :aria-label="t('about.tapHint')" @click="greet">
          <img :src="profilePicture" alt="Foto de Clara Lívia" width="512" height="512" fetchpriority="high" />
          <Transition name="pop">
            <span v-if="bubble" class="bubble">{{ bubble }}</span>
          </Transition>
        </button>
        <p class="flex flex-col gap-y-1 text-sm text-muted md:mt-4 md:flex-row md:flex-wrap md:items-center md:gap-x-4">
          <span class="inline-flex items-center gap-2">
            <span class="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true"></span>
            {{ t('about.available') }}
          </span>
          <span v-if="clock">{{ t('about.location') }} · {{ clock }}</span>
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rise {
  animation: rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--d, 0ms);
}
@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
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

.story {
  min-height: 3.2rem;
  max-width: 44ch;
  color: rgb(var(--muted));
}
.story-enter-active,
.story-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.story-enter-from,
.story-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

/* The portrait: a plain photo that answers when you press it. */
.portrait {
  position: relative;
  display: block;
  flex-shrink: 0;
  width: 6.25rem;
  cursor: pointer;
  border-radius: 1.25rem;
  transition: transform 0.2s ease;
}
.portrait:active {
  transform: scale(0.98);
}
.portrait img {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 5;
  border-radius: 1.25rem;
  object-fit: cover;
  object-position: top;
}
@media (min-width: 768px) {
  .portrait {
    width: 100%;
  }
}
.bubble {
  position: absolute;
  left: 0.75rem;
  bottom: 0.75rem;
  border-radius: 9999px;
  padding: 0.4rem 0.9rem;
  font-size: 0.9rem;
  font-weight: 600;
  background: rgb(var(--surface));
  color: rgb(var(--ink));
}
.pop-enter-active,
.pop-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(0.85);
}

@media (prefers-reduced-motion: reduce) {
  .rise {
    animation: none;
  }
  .story-enter-active,
  .story-leave-active,
  .pop-enter-active,
  .pop-leave-active {
    transition: none;
  }
}
</style>
