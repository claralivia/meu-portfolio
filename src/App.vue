<script setup lang="ts">
import Navbar from './components/Navbar.vue'
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
  <div class="relative min-h-screen overflow-x-clip">
    <Navbar />

    <main class="mx-auto w-full max-w-5xl px-6">
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
  bottom: 1.5rem;
  z-index: 60;
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
