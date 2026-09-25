<script setup lang="ts">
import Navbar from './components/Navbar.vue'
import BackToTop from './components/BackToTop.vue'
import BackgroundManager from './components/BackgroundManager.vue'
import SideElements from './components/SideElements.vue'
import Footer from './components/Footer.vue'
import ScrollIsland from './components/ScrollIsland.vue'
import CommandPalette from './components/CommandPalette.vue'
import { inject as injectAnalytics } from '@vercel/analytics'
import { injectSpeedInsights } from '@vercel/speed-insights'
import { useTrackedLink } from './composables/useTrackedLink'

injectAnalytics()
injectSpeedInsights()
useTrackedLink()
</script>

<template>
  <div
    class="relative min-h-screen overflow-x-clip font-sans antialiased transition-colors duration-300 bg-neutral-100 text-neutral-800 dark:bg-[#0a0a0a] dark:text-gray-200"
  >
    <div
      class="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-blue-400/10 via-purple-400/10 to-emerald-400/10 dark:bg-none"
    ></div>

    <BackgroundManager />

    <Navbar />

    <ScrollIsland />

    <SideElements />

    <div class="relative z-10 max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <main>
        <RouterView />
      </main>
    </div>

    <Footer />
    <BackToTop />
    <CommandPalette />
  </div>
</template>

<style>
html {
  scroll-behavior: smooth;
}

a:focus-visible,
button:focus-visible,
[role="button"]:focus-visible {
  @apply outline outline-2 outline-offset-2 outline-blue-500 dark:outline-blue-400;
}

/* Phones get a more opaque tint instead of backdrop-filter: blurring every card
   while scrolling is what made mobile rendering stall. */
.card-glass {
  @apply relative bg-gradient-to-br from-white/70 to-white/40 dark:from-neutral-800/70 dark:to-neutral-900/50 md:from-white/50 md:to-white/20 md:dark:from-neutral-800/50 md:dark:to-neutral-900/20 md:backdrop-blur-3xl border border-white/60 dark:border-neutral-700/50 rounded-[2rem] shadow-xl shadow-black/5 dark:shadow-black/30 transition-all duration-500;
}
@media (hover: hover) {
  .card-glass:hover {
    @apply shadow-2xl shadow-black/10 dark:shadow-black/40 -translate-y-2;
  }
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
