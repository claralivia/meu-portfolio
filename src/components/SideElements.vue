<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import GithubIcon from './icons/GithubIcon.vue'
import LinkedinIcon from './icons/LinkedinIcon.vue'
import { useAnalytics } from '../composables/useAnalytics'

const { tm } = useI18n()
const { trackClick } = useAnalytics()

interface ContactInfo {
  email: string
  linkedinUrl: string
  githubUrl: string
}

const contactInfo = computed((): ContactInfo => (tm('contact') as ContactInfo) || {})
</script>

<template>
  <div class="hidden lg:flex flex-col items-center gap-6 fixed bottom-0 left-8 xl:left-12 z-40">
    <a
      :href="contactInfo.githubUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="w-6 h-6 text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 transition-all duration-300 hover:-translate-y-1"
      aria-label="GitHub"
      @click="() => trackClick('click_github', { section: 'sidebar' })"
    >
      <GithubIcon />
    </a>
    <a
      :href="contactInfo.linkedinUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="w-6 h-6 text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 transition-all duration-300 hover:-translate-y-1"
      aria-label="LinkedIn"
      @click="() => trackClick('click_linkedin', { section: 'sidebar' })"
    >
      <LinkedinIcon />
    </a>
    <div class="w-px h-24 bg-gray-300 dark:bg-gray-700"></div>
  </div>

  <div class="hidden lg:flex flex-col items-center gap-6 fixed bottom-0 right-8 xl:right-12 z-40">
    <a
      :href="`mailto:${contactInfo.email}`"
      class="text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 transition-all duration-300 hover:-translate-y-1 text-sm tracking-widest"
      style="writing-mode: vertical-rl;"
      @click="() => trackClick('click_email', { section: 'sidebar' })"
    >
      {{ contactInfo.email }}
    </a>
    <div class="w-px h-24 bg-gray-300 dark:bg-gray-700"></div>
  </div>
</template>