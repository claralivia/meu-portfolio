<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, ref } from 'vue'
import { useMouseInElement } from '@vueuse/core'
import GithubIcon from './icons/GithubIcon.vue'
import LinkedinIcon from './icons/LinkedinIcon.vue'
import { ArrowDownTrayIcon } from '@heroicons/vue/24/outline'
import { useAnalytics } from '../composables/useAnalytics'

const { t } = useI18n()
const { trackClick } = useAnalytics()

const target = ref<HTMLElement | null>(null)
const { elementX, elementY, isOutside, elementHeight, elementWidth } = useMouseInElement(target)

const tiltStyle = computed(() => {
  if (isOutside.value) {
    return {
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
      transition: 'transform 0.5s ease-out',
    }
  }
  const maxTilt = 5
  const centerX = elementWidth.value / 2
  const centerY = elementHeight.value / 2
  const normalizedX = (elementX.value - centerX) / centerX
  const normalizedY = (elementY.value - centerY) / centerY
  const tiltY = normalizedX * maxTilt
  const tiltX = -normalizedY * maxTilt
  return {
    transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
    transition: 'transform 0.05s linear',
  }
})

const profilePicture = new URL('../assets/minha-foto.jpg', import.meta.url).href

const formattedTitle = computed(() => {
  return t('about.title').replace(
    'Fullstack',
    '<span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-emerald-500 dark:from-blue-400 dark:via-purple-400 dark:to-emerald-400 bg-[length:200%_auto] animate-gradient-text">Fullstack</span>'
  )
})
</script>

<template>
  <section id="about" ref="target" class="py-16 sm:py-24">
    <div
      :style="tiltStyle"
      class="relative max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12 p-8 md:p-12 rounded-[2.5rem] bg-white/20 dark:bg-white/5 backdrop-blur-3xl border border-white/40 dark:border-white/10 shadow-2xl shadow-gray-300/30 dark:shadow-black/40 transition-all duration-500"
    >
      <div class="w-48 md:w-64 flex-shrink-0 relative group animate-float-avatar">
          <img
            :src="profilePicture"
            alt="Foto de Clara Lívia"
            class="rounded-full w-48 h-48 md:w-64 md:h-64 object-cover mx-auto border-4 border-white/40 dark:border-white/20 shadow-lg dark:shadow-xl dark:shadow-black/30 transition-all duration-500 group-hover:scale-[1.03] group-hover:-rotate-2"
          />
          <div
            class="absolute -inset-4 rounded-full bg-neutral-400/20 dark:bg-neutral-600/20 filter blur-3xl opacity-50 dark:opacity-30 -z-10 transition-all duration-500 group-hover:opacity-80 dark:group-hover:opacity-60 group-hover:scale-110"
          ></div>
        </div>

        <!-- min-w-0 evita que o texto estique o flexbox e quebre o padding da direita -->
        <div class="flex-1 min-w-0 text-center md:text-left">
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight mb-6" v-html="formattedTitle"></h1>
          <p class="text-lg mb-8 text-gray-600 dark:text-gray-300 leading-relaxed">
            {{ t('about.description') }}
          </p>

          <div class="flex flex-wrap gap-4 justify-center md:justify-start">
            <a
              href="/curriculo.pdf"
              target="_blank"
              class="flex items-center gap-2 font-medium py-3 px-6 rounded-2xl bg-white/50 dark:bg-neutral-700/50 border border-white/60 dark:border-neutral-600/50 backdrop-blur-md shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-neutral-900 dark:text-white"
              @click="() => trackClick('click_resume_download', { section: 'about' })"
            >
              <ArrowDownTrayIcon class="w-5 h-5" />
              {{ t('buttons.resume') }}
            </a>

            <a
              :href="t('contact.linkedinUrl')"
              target="_blank"
              class="flex items-center gap-2 font-medium py-3 px-6 rounded-2xl bg-white/50 dark:bg-neutral-700/50 border border-white/60 dark:border-neutral-600/50 backdrop-blur-md shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-neutral-900 dark:text-white"
              @click="() => trackClick('click_linkedin', { section: 'about' })"
            >
              <LinkedinIcon class="w-5 h-5" />
              {{ t('buttons.linkedin') }}
            </a>

            <a
              :href="t('contact.githubUrl')"
              target="_blank"
              class="flex items-center gap-2 font-medium py-3 px-6 rounded-2xl bg-white/50 dark:bg-neutral-700/50 border border-white/60 dark:border-neutral-600/50 backdrop-blur-md shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-neutral-900 dark:text-white"
              @click="() => trackClick('click_github', { section: 'about' })"
            >
              <GithubIcon class="w-5 h-5" />
              {{ t('buttons.github') }}
            </a>
          </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes float-avatar {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
}
.animate-float-avatar {
  animation: float-avatar 6s ease-in-out infinite;
}

@keyframes gradient-text {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.animate-gradient-text {
  animation: gradient-text 5s ease infinite;
}
</style>
