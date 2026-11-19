<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAnalytics } from '../composables/useAnalytics'

const { t } = useI18n()
const { trackClick } = useAnalytics()
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 pb-24 pt-8 md:px-10 md:pb-8 text-sm text-muted">
    <p>&copy; {{ currentYear }} Clara Lívia · {{ t('footer.colophon') }}</p>
    <a
      href="https://github.com/claralivia/meu-portfolio"
      target="_blank"
      rel="noopener noreferrer"
      class="transition-colors hover:text-ink"
      @click="() => trackClick('click_source_code', { section: 'footer' })"
    >
      {{ t('footer.source') }}
    </a>
  </footer>
</template>
