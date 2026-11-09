<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AboutSection from '../components/AboutSection.vue'
import ProjectsSection from '../components/ProjectsSection.vue'
import ExperienceSection from '../components/ExperienceSection.vue'
import ContactSection from '../components/ContactSection.vue'
import { usePageMeta } from '../composables/usePageMeta'

const { t } = useI18n()

usePageMeta(() => ({
  title: `Clara Lívia | ${t('about.title')}`,
  description: t('seo.description'),
}))
</script>

<template>
  <!-- No reveal on the first screen: it must be visible immediately. -->
  <AboutSection />
  <ProjectsSection />
  <ExperienceSection />
  <ContactSection />
</template>
