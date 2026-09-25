<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AboutSection from '../components/AboutSection.vue'
import TechDock from '../components/TechDock.vue'
import ProjectsSection from '../components/ProjectsSection.vue'
import SkillsAndContact from '../components/SkillsAndContact.vue'
import EducationSection from '../components/EducationSection.vue'
import ExperienceSection from '../components/ExperienceSection.vue'
import ContactSection from '../components/ContactSection.vue'
import { usePageMeta } from '../composables/usePageMeta'

const { t } = useI18n()

usePageMeta(() => ({
  title: `Clara Lívia | ${t('about.title')}`,
  description: t('about.description'),
}))
</script>

<template>
  <!-- No reveal on the first screen: it must be visible immediately. -->
  <AboutSection />
  <div v-reveal>
    <TechDock />
  </div>
  <div v-reveal>
    <ProjectsSection />
  </div>
  <div v-reveal>
    <SkillsAndContact />
  </div>
  <div v-reveal>
    <EducationSection />
  </div>
  <div v-reveal>
    <ExperienceSection />
  </div>
  <div v-reveal>
    <ContactSection />
  </div>
</template>
