<script setup lang="ts">
import SideRail from './components/SideRail.vue'
import Footer from './components/Footer.vue'
import CommandPalette from './components/CommandPalette.vue'
import { inject as injectAnalytics } from '@vercel/analytics'
import { injectSpeedInsights } from '@vercel/speed-insights'
import { useTrackedLink } from './composables/useTrackedLink'
import { useBrandTab } from './composables/useBrandTab'
import { useSecrets } from './composables/useSecrets'

injectAnalytics()
injectSpeedInsights()
useTrackedLink()
useBrandTab()
const { toast } = useSecrets()
</script>

<template>
  <div class="relative isolate z-0 min-h-screen overflow-x-clip md:pl-[4.5rem]">
    <SideRail />

    <main class="mx-auto w-full max-w-6xl px-6 md:px-10">
      <RouterView />
    </main>

    <Footer />
    <CommandPalette />

    <Transition name="toast">
      <p v-if="toast" role="status" class="toast">{{ toast }}</p>
    </Transition>
  </div>
</template>

<style scoped>
.toast {
  position: fixed;
  left: 50%;
  bottom: 1.6rem;
  z-index: 70;
  translate: -50% 0;
  border-radius: 9999px;
  padding: 0.6rem 1.1rem;
  font-size: 0.9rem;
  font-weight: 500;
  background: rgb(var(--ink));
  color: rgb(var(--surface));
}
.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
