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
  <section class="flex min-h-[100svh] items-center py-28">
    <div>
      <p class="text-[clamp(5rem,18vw,10rem)] font-semibold leading-none text-ink/15" style="letter-spacing: -0.05em">404</p>
      <h1 class="mt-4 text-3xl font-semibold text-ink" style="letter-spacing: -0.03em">{{ t('notFound.title') }}</h1>
      <p class="mt-3 max-w-[40ch] text-muted">{{ t('notFound.description') }}</p>
      <RouterLink to="/" class="pill-glass mt-8">
        <ArrowLeftIcon class="h-4 w-4" />
        {{ t('notFound.back') }}
      </RouterLink>
    </div>
  </section>
</template>
