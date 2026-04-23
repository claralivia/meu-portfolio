<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { EnvelopeIcon } from '@heroicons/vue/24/solid'
import GithubIcon from './icons/GithubIcon.vue'
import LinkedinIcon from './icons/LinkedinIcon.vue'
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
    <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
      {{ t('contact.description') }}
    </p>

    <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
      <a :href="contactInfo.linkedinUrl" target="_blank" class="contact-btn w-full sm:w-auto" @click="() => trackClick('click_linkedin', { section: 'contact' })">
        <LinkedinIcon class="w-6 h-6" />
        <span>LinkedIn</span>
      </a>
      <a :href="contactInfo.githubUrl" target="_blank" class="contact-btn w-full sm:w-auto" @click="() => trackClick('click_github', { section: 'contact' })">
        <GithubIcon class="w-6 h-6" />
        <span>GitHub</span>
      </a>
      <a :href="`mailto:${contactInfo.email}`" class="contact-btn w-full sm:w-auto" @click="() => trackClick('click_email')">
        <EnvelopeIcon class="w-6 h-6" />
        <span>E-mail</span>
      </a>
    </div>
  </section>
</template>

<style scoped>
.contact-btn {
  @apply flex items-center justify-center gap-2 font-medium py-3 px-6 rounded-2xl bg-white/50 dark:bg-neutral-700/50 border border-white/60 dark:border-neutral-600/50 backdrop-blur-md shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-neutral-900 dark:text-white;
}
</style>