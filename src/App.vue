<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useShowcase } from './composables/useShowcase'
import Navbar from './components/Navbar.vue'
import StageFrame from './components/StageFrame.vue'
import Sky from './components/Sky.vue'
import TideOverlay from './components/TideOverlay.vue'
import BackToTop from './components/BackToTop.vue'
import Footer from './components/Footer.vue'
import CommandPalette from './components/CommandPalette.vue'
import { inject as injectAnalytics } from '@vercel/analytics'
import { injectSpeedInsights } from '@vercel/speed-insights'
import { useTrackedLink } from './composables/useTrackedLink'
import { useBrandTab } from './composables/useBrandTab'

const route = useRoute()
const { isStage } = useShowcase()

injectAnalytics()
injectSpeedInsights()
useTrackedLink()
useBrandTab()
</script>

<template>
  <div class="relative min-h-screen overflow-x-clip">
    <!-- Filters that roughen the edges of the clouds (menu and stickers). Each cloud is
         a few soft layers; displacing their edges with noise makes them billow. -->
    <svg width="0" height="0" style="position: absolute" aria-hidden="true" focusable="false">
      <defs>
        <filter id="cn-shade" x="-8%" y="-100%" width="116%" height="300%">
          <feTurbulence type="fractalNoise" baseFrequency="0.010 0.019" numOctaves="4" seed="2" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="52" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feGaussianBlur in="d" stdDeviation="3" />
        </filter>
        <filter id="cn-body" x="-8%" y="-100%" width="116%" height="300%">
          <feTurbulence id="cn-body-turb" type="fractalNoise" baseFrequency="0.0115 0.021" numOctaves="4" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="44" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feGaussianBlur in="d" stdDeviation="1.4" />
        </filter>
        <filter id="cn-light" x="-8%" y="-100%" width="116%" height="300%">
          <feTurbulence id="cn-light-turb" type="fractalNoise" baseFrequency="0.0145 0.0245" numOctaves="4" seed="11" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="36" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feGaussianBlur in="d" stdDeviation="3.6" />
        </filter>
        <filter id="cd-a" x="-12%" y="-12%" width="124%" height="124%">
          <feTurbulence type="fractalNoise" baseFrequency="0.017 0.021" numOctaves="4" seed="5" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="22" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feGaussianBlur in="d" stdDeviation="2.6" />
        </filter>
        <filter id="cd-b" x="-12%" y="-12%" width="124%" height="124%">
          <feTurbulence type="fractalNoise" baseFrequency="0.022 0.027" numOctaves="3" seed="13" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="18" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feGaussianBlur in="d" stdDeviation="5" />
        </filter>
        <filter id="cc-a" x="-30%" y="-70%" width="160%" height="240%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05 0.07" numOctaves="3" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="13" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feGaussianBlur in="d" stdDeviation="0.8" />
        </filter>
        <filter id="cc-b" x="-30%" y="-70%" width="160%" height="240%">
          <feTurbulence type="fractalNoise" baseFrequency="0.065 0.085" numOctaves="3" seed="9" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="10" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feGaussianBlur in="d" stdDeviation="2.2" />
        </filter>
      </defs>
    </svg>

    <Sky :home="route.name === 'home'" />
    <StageFrame v-if="route.name === 'home' && isStage" />
    <TideOverlay v-if="route.name === 'home' && isStage" />

    <Navbar />

    <main class="relative z-10 mx-auto w-full max-w-6xl px-5 sm:px-8">
      <RouterView />
    </main>

    <Footer />
    <BackToTop />
    <CommandPalette />
  </div>
</template>
