<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import GithubIcon from './icons/GithubIcon.vue'
import LinkedinIcon from './icons/LinkedinIcon.vue'
import { useAnalytics } from '../composables/useAnalytics'

const { t, tm } = useI18n()
const { trackClick } = useAnalytics()

interface ContactInfo {
  linkedinUrl: string
  githubUrl: string
}

const contactInfo = computed((): ContactInfo => (tm('contact') as ContactInfo) || {})
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 text-center">
    <div class="flex justify-center gap-6 mb-6 lg:hidden">
      <a
        :href="contactInfo.githubUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="w-6 h-6 text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 transition-colors duration-300"
        aria-label="GitHub"
        @click="() => trackClick('click_github', { section: 'footer' })"
      >
        <GithubIcon />
      </a>
      <a
        :href="contactInfo.linkedinUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="w-6 h-6 text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 transition-colors duration-300"
        aria-label="LinkedIn"
        @click="() => trackClick('click_linkedin', { section: 'footer' })"
      >
        <LinkedinIcon />
      </a>
    </div>
    <p class="text-sm text-gray-500 dark:text-gray-400 tracking-wider">
      {{ t('footer.credit') }}
    </p>
    <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">
      &copy; {{ currentYear }} Clara Lívia. {{ t('footer.rights') }}
    </p>
  </footer>
</template>