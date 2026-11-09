<script setup lang="ts">
import { useRoute } from 'vue-router'
import Navbar from './components/Navbar.vue'
import StageFrame from './components/StageFrame.vue'
import BackToTop from './components/BackToTop.vue'
import Footer from './components/Footer.vue'
import CommandPalette from './components/CommandPalette.vue'
import { inject as injectAnalytics } from '@vercel/analytics'
import { injectSpeedInsights } from '@vercel/speed-insights'
import { useTrackedLink } from './composables/useTrackedLink'

const route = useRoute()

injectAnalytics()
injectSpeedInsights()
useTrackedLink()
</script>

<template>
  <div class="relative min-h-screen overflow-x-clip">
    <div class="ambient" aria-hidden="true"></div>
    <StageFrame v-if="route.name === 'home'" />

    <Navbar />

    <main class="relative z-10 mx-auto w-full max-w-6xl px-5 sm:px-8">
      <RouterView />
    </main>

    <Footer />
    <BackToTop />
    <CommandPalette />
  </div>
</template>
