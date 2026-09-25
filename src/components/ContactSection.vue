<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { EnvelopeIcon } from '@heroicons/vue/24/outline'
import GithubIcon from './icons/GithubIcon.vue'
import LinkedinIcon from './icons/LinkedinIcon.vue'
import ContactForm from './ContactForm.vue'
import { useAnalytics } from '../composables/useAnalytics'

interface ContactInfo {
  title: string
  description: string
  email: string
  linkedinUrl: string
  githubUrl: string
}

const { t, tm } = useI18n()
const { trackClick } = useAnalytics()
const contactInfo = computed((): ContactInfo => (tm('contact') as ContactInfo) || {})
</script>

<template>
  <section id="contact" class="py-16 sm:py-24 text-center">
    <h2 class="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white mb-4">
      {{ t('contact.title') }}
    </h2>
    <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
      {{ t('contact.description') }}
    </p>

    <div class="inline-flex items-center gap-2 py-2 px-4 mb-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
      <span class="relative flex h-2.5 w-2.5">
        <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
        <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
      </span>
      {{ t('contact.freelanceAvailability') }}
    </div>

    <ContactForm />

    <!-- Share-sheet style: three equal glass tiles, brand-tinted glyph over a soft disc. -->
    <nav class="grid grid-cols-3 gap-3 sm:gap-4 max-w-md mx-auto" :aria-label="t('contact.title')">
      <a :href="contactInfo.linkedinUrl" target="_blank" rel="noopener noreferrer" class="contact-tile group" @click="() => trackClick('click_linkedin', { section: 'contact' })">
        <span class="contact-disc text-[#0A66C2] dark:text-[#4c9be8]"><LinkedinIcon class="w-6 h-6" /></span>
        <span class="contact-label">LinkedIn</span>
      </a>
      <a :href="contactInfo.githubUrl" target="_blank" rel="noopener noreferrer" class="contact-tile group" @click="() => trackClick('click_github', { section: 'contact' })">
        <span class="contact-disc text-neutral-900 dark:text-white"><GithubIcon class="w-6 h-6" /></span>
        <span class="contact-label">GitHub</span>
      </a>
      <a :href="`mailto:${contactInfo.email}`" class="contact-tile group" @click="() => trackClick('click_email')">
        <span class="contact-disc text-rose-500 dark:text-rose-400"><EnvelopeIcon class="w-6 h-6" /></span>
        <span class="contact-label">E-mail</span>
      </a>
    </nav>
  </section>
</template>

<style scoped>
.contact-tile {
  @apply flex flex-col items-center gap-2.5 py-4 px-2 rounded-3xl bg-gradient-to-br from-white/50 to-white/20 dark:from-white/10 dark:to-white/5 border border-white/50 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/20 hover:shadow-xl hover:from-white/70 hover:to-white/30 dark:hover:from-white/15 dark:hover:to-white/5 hover:-translate-y-1 transition-all duration-300 md:backdrop-blur-lg;
}
.contact-disc {
  @apply flex items-center justify-center w-12 h-12 rounded-full bg-white/80 dark:bg-white/10 shadow-sm ring-1 ring-inset ring-black/5 dark:ring-white/10 transition-transform duration-300 group-hover:scale-110;
}
.contact-label {
  @apply text-sm font-semibold text-neutral-800 dark:text-gray-200;
}
</style>