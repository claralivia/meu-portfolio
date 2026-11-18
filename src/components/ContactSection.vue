<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowUpRightIcon } from '@heroicons/vue/24/outline'
import ContactForm from './ContactForm.vue'
import { useAnalytics } from '../composables/useAnalytics'
import { useShowcase } from '../composables/useShowcase'
import profilePicture from '../assets/minha-foto.webp'

const { t, tm } = useI18n()
// tm, not t: vue-i18n reads the @ in an e-mail address as message syntax.
const contact = computed(() => tm('contact') as { email: string; linkedinUrl: string; githubUrl: string })
const { trackClick } = useAnalytics()
const { isStage, isNight } = useShowcase()
</script>

<template>
  <section id="contact" class="py-20 sm:py-28">
    <div class="relative">
    <!-- The lighthouse the plane was heading for. Its beam sweeps once it is night. -->
    <svg class="lighthouse" :class="{ on: isNight }" viewBox="0 0 120 190" aria-hidden="true">
      <defs>
        <linearGradient id="beam-l" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stop-color="#fff3c4" stop-opacity="0.85" />
          <stop offset="1" stop-color="#fff3c4" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="beam-r" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#fff3c4" stop-opacity="0.85" />
          <stop offset="1" stop-color="#fff3c4" stop-opacity="0" />
        </linearGradient>
      </defs>
      <g class="beams">
        <path class="beam beam-a" d="M60 62 L-260 14 L-260 110 Z" fill="url(#beam-l)" />
        <path class="beam beam-b" d="M60 62 L380 14 L380 110 Z" fill="url(#beam-r)" />
      </g>
      <path d="M42 188 L50 78 H70 L78 188 Z" fill="#fdf3e3" />
      <path d="M45 150 H75 L77 168 H43 Z M48.5 104 H71.5 L73 122 H47 Z" fill="#ff7045" />
      <rect x="44" y="70" width="32" height="8" rx="2" fill="#26406a" />
      <rect x="49" y="50" width="22" height="22" rx="3" fill="#fff3c4" class="lamp" />
      <path d="M46 50 L60 36 L74 50 Z" fill="#ff7045" />
    </svg>
    <!-- The glass behind this panel is the StageFrame (App level), which becomes it. -->
    <div id="contact-slot" class="night m-sheet grid gap-10 rounded-2xl p-6 sm:p-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:p-14" :class="isStage ? '' : 'glass-flat'">
      <div v-reveal="250" class="min-w-0">
        <!-- The portrait lands here, closing the loop that started in the hero. -->
        <div id="contact-avatar" class="mb-6 h-16 w-16 rounded-full" aria-hidden="true">
          <img v-if="!isStage" :src="profilePicture" alt="" width="64" height="64" class="h-full w-full rounded-full object-cover" />
        </div>
        <h2 class="section-title !text-4xl sm:!text-5xl">{{ t('contact.title') }}</h2>
        <p class="mt-5 max-w-[38ch] text-lg leading-relaxed text-muted">{{ t('contact.description') }}</p>

        <a
          :href="`mailto:${contact.email}`"
          class="mt-8 inline-block break-all text-xl font-medium text-accent underline-offset-4 hover:underline sm:text-2xl"
          @click="() => trackClick('click_email')"
        >
          {{ contact.email }}
        </a>

        <ul class="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
          <li>
            <a
              :href="contact.linkedinUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 text-muted transition-colors hover:text-ink"
              @click="() => trackClick('click_linkedin', { section: 'contact' })"
            >
              LinkedIn <ArrowUpRightIcon class="h-3.5 w-3.5" />
            </a>
          </li>
          <li>
            <a
              :href="contact.githubUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 text-muted transition-colors hover:text-ink"
              @click="() => trackClick('click_github', { section: 'contact' })"
            >
              GitHub <ArrowUpRightIcon class="h-3.5 w-3.5" />
            </a>
          </li>
        </ul>
      </div>

      <ContactForm v-reveal="380" />
    </div>
    </div>
  </section>
</template>

<style scoped>
.lighthouse {
  position: absolute;
  right: 3.5rem;
  bottom: calc(100% - 1px);
  width: 90px;
  height: 142px;
  overflow: visible;
  z-index: 2;
  pointer-events: none;
}
.beams {
  opacity: 0;
  transition: opacity 1.2s ease;
}
.lighthouse.on .beams {
  opacity: 1;
}
.lamp {
  filter: drop-shadow(0 0 5px rgb(255 235 170 / 0.4));
}
.lighthouse.on .lamp {
  animation: lamp 3.4s ease-in-out infinite;
}
/* A rotating beam seen from the side: it swings out to one side, fades, and comes
   round on the other. */
.beam-a {
  animation: beam 6.8s ease-in-out infinite;
  transform-origin: 60px 62px;
}
.beam-b {
  animation: beam 6.8s ease-in-out infinite -3.4s;
  transform-origin: 60px 62px;
}
@keyframes beam {
  0% {
    opacity: 0;
    transform: scaleX(0.15);
  }
  30% {
    opacity: 1;
    transform: scaleX(1);
  }
  55% {
    opacity: 0.95;
    transform: scaleX(1);
  }
  100% {
    opacity: 0;
    transform: scaleX(0.15);
  }
}
@keyframes lamp {
  50% {
    filter: drop-shadow(0 0 12px rgb(255 235 170 / 0.95));
  }
}
@media (max-width: 767px) {
  .lighthouse {
    right: 1.2rem;
    width: 64px;
    height: 100px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .beam-a,
  .beam-b,
  .lamp {
    animation: none;
  }
  .beam-b {
    display: none;
  }
}
</style>
