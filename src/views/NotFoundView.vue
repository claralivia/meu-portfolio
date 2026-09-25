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
  <section class="min-h-[60vh] flex items-center justify-center py-16">
    <div class="card-glass p-8 sm:p-12 text-center max-w-lg">
      <div class="relative z-10">
        <p class="text-6xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-emerald-500 dark:from-blue-400 dark:via-purple-400 dark:to-emerald-400 mb-4">404</p>
        <h1 class="text-2xl font-bold text-neutral-900 dark:text-white mb-3">{{ t('notFound.title') }}</h1>
        <p class="text-gray-600 dark:text-gray-300 mb-8">{{ t('notFound.description') }}</p>
        <RouterLink
          to="/"
          class="inline-flex items-center gap-2 font-medium py-3 px-6 rounded-2xl bg-gradient-to-br from-white/50 to-white/20 dark:from-white/10 dark:to-white/5 border border-white/50 dark:border-white/10 shadow-lg shadow-black/5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 text-neutral-900 dark:text-white"
        >
          <ArrowLeftIcon class="w-4 h-4" />
          {{ t('notFound.back') }}
        </RouterLink>
      </div>
    </div>
  </section>
</template>
