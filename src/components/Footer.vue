<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAnalytics } from '../composables/useAnalytics'

const { t } = useI18n()
const { trackClick } = useAnalytics()
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="relative z-10 mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 pb-10 pt-6 text-sm text-muted sm:px-8">
    <p>&copy; {{ currentYear }} Clara Lívia</p>
    <p>
      {{ t('footer.colophon') }} ·
      <a
        href="https://github.com/claralivia/meu-portfolio"
        target="_blank"
        rel="noopener noreferrer"
        class="underline decoration-ink/20 underline-offset-4 transition-colors hover:text-ink"
        @click="() => trackClick('click_source_code', { section: 'footer' })"
      >{{ t('footer.source') }}</a>
    </p>
  </footer>
</template>
