<script setup lang="ts">
import Navbar from './components/Navbar.vue'
import AboutSection from './components/AboutSection.vue'
import ExperienceSection from './components/ExperienceSection.vue'
import EducationSection from './components/EducationSection.vue'
import ProjectsSection from './components/ProjectsSection.vue'
import SkillsAndContact from './components/SkillsAndContact.vue'
import ContactSection from './components/ContactSection.vue'
import BackToTop from './components/BackToTop.vue'
import BackgroundManager from './components/BackgroundManager.vue'
import SideElements from './components/SideElements.vue'
import Footer from './components/Footer.vue'
import RevealOnScroll from './components/RevealOnScroll.vue'
import { computed, watchEffect } from 'vue'
import { useWindowScroll, useWindowSize } from '@vueuse/core'
import { useI18n } from 'vue-i18n'

const { y } = useWindowScroll()
const { height } = useWindowSize()

const scrollProgress = computed(() => {
  if (typeof document === 'undefined') return 0
  const scrollHeight = document.documentElement.scrollHeight
  const maxScroll = Math.max(scrollHeight - height.value, 1)
  return Math.min(Math.max(y.value / maxScroll, 0), 1)
})

const { t } = useI18n()

watchEffect(() => {
  if (typeof document === 'undefined') return
  
  const title = `Clara Lívia | ${t('about.title')}`
  const description = t('about.description')

  document.title = title

  const setMeta = (name: string, content: string, isProperty = false) => {
    const attr = isProperty ? 'property' : 'name'
    let el = document.querySelector(`meta[${attr}="${name}"]`)
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute(attr, name)
      document.head.appendChild(el)
    }
    el.setAttribute('content', content)
  }

  setMeta('description', description)
  setMeta('og:title', title, true)
  setMeta('og:description', description, true)
  setMeta('og:type', 'website', true)
  setMeta('og:url', 'https://claralivia.dev/', true)
  setMeta('og:image', 'https://claralivia.dev/og-image.png', true)
  setMeta('twitter:card', 'summary_large_image')
})
</script>

<template>
  <div
    class="relative min-h-screen overflow-hidden font-sans antialiased transition-colors duration-300 bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-gray-200"
  >
    <div
      class="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-blue-400/10 via-purple-400/10 to-emerald-400/10 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-emerald-500/10"
      :style="{
        backgroundSize: '100% 300%',
        backgroundPosition: `0% ${scrollProgress * 100}%`
      }"
    ></div>

    <BackgroundManager />

    <Navbar />

    <SideElements />

    <div class="relative z-10 max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <main>
        <RevealOnScroll>
          <AboutSection />
        </RevealOnScroll>
        <RevealOnScroll>
          <ProjectsSection />
        </RevealOnScroll>
        <RevealOnScroll>
          <SkillsAndContact />
        </RevealOnScroll>
        <RevealOnScroll>
          <EducationSection />
        </RevealOnScroll>
        <RevealOnScroll>
          <ExperienceSection />
        </RevealOnScroll>
        <RevealOnScroll>
          <ContactSection />
        </RevealOnScroll>
      </main>
    </div>

    <Footer />
    <BackToTop />
  </div>
</template>

<style>
html {
  scroll-behavior: smooth;
}

::-webkit-scrollbar {
  width: 16px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.4);
  border-radius: 16px;
  border: 5px solid transparent;
  background-clip: content-box;
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.7);
}

html.dark::-webkit-scrollbar-thumb,
.dark ::-webkit-scrollbar-thumb {
  background-color: rgba(209, 213, 219, 0.3);
}

html.dark::-webkit-scrollbar-thumb:hover,
.dark ::-webkit-scrollbar-thumb:hover {
  background-color: rgba(209, 213, 219, 0.5);
}

* {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.4) transparent;
}

html.dark {
  scrollbar-color: rgba(209, 213, 219, 0.2) transparent;
}
.dark * {
  scrollbar-color: rgba(209, 213, 219, 0.2) transparent;
}
</style>
