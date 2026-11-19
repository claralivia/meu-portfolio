<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import { usePageMeta } from '../composables/usePageMeta'

const { t } = useI18n()
const route = useRoute()

// ProjectView renders this for unknown slugs and sets its own meta.
if (route.name === 'not-found') {
  usePageMeta(() => ({ title: `${t('notFound.title')} | Clara Lívia`, description: t('notFound.description'), path: route.path }))
}
</script>

<template>
  <section class="flex min-h-[80svh] items-center py-28">
    <div>
      <p class="text-sm font-semibold text-accent">404</p>
      <h1 class="mt-3 font-display text-4xl font-bold text-ink sm:text-5xl" style="letter-spacing: -0.04em">{{ t('notFound.title') }}</h1>
      <p class="mt-3 max-w-[40ch] text-muted">{{ t('notFound.description') }}</p>
      <RouterLink to="/" class="pill-glass mt-8">
        <ArrowLeftIcon class="h-4 w-4" />
        {{ t('notFound.back') }}
      </RouterLink>
    </div>
  </section>
</template>
