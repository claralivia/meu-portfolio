<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import GithubIcon from './icons/GithubIcon.vue'
import LinkedinIcon from './icons/LinkedinIcon.vue'
import { useAnalytics } from '../composables/useAnalytics'

const { t, tm } = useI18n()
const contact = computed(() => tm('contact') as { linkedinUrl: string; githubUrl: string })
const { trackClick } = useAnalytics()
</script>

<template>
  <section id="about" class="hero flex min-h-[100svh] items-center pb-16 pt-28 sm:pb-24">
    <div class="hero-content grid w-full items-center gap-8 md:grid-cols-[1fr_auto] md:gap-16">
      <!-- The StageFrame (App level) starts here, as the portrait. -->
      <div id="hero-slot" class="h-28 w-28 sm:h-36 sm:w-36 md:order-2 md:h-72 md:w-72" aria-hidden="true"></div>

      <div class="min-w-0 max-w-xl md:order-1">
        <h1 class="hero-in text-[clamp(3.25rem,10vw,6rem)] font-semibold leading-[0.98] text-ink" style="letter-spacing: -0.04em">
          Clara Lívia
        </h1>

        <p class="hero-in mt-5 text-lg text-ink sm:text-xl" style="--d: 100ms">
          {{ t('about.role') }}<span class="text-muted"> · {{ t('about.company') }}</span>
        </p>

        <p class="hero-in mt-4 max-w-[34ch] text-[17px] leading-relaxed text-muted sm:text-lg" style="--d: 180ms">
          {{ t('about.tagline') }}
        </p>

        <div class="hero-in mt-9 flex flex-wrap items-center gap-3" style="--d: 260ms">
          <RouterLink to="/#projects" class="pill-solid" @click="() => trackClick('click_hero_projects')">
            {{ t('about.cta') }}
          </RouterLink>
          <RouterLink to="/#contact" class="pill-glass" @click="() => trackClick('click_hero_contact')">
            {{ t('navbar.contact') }}
          </RouterLink>
          <span class="mx-1 hidden h-5 w-px bg-ink/15 sm:block" aria-hidden="true"></span>
          <a
            :href="contact.githubUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="social"
            :aria-label="t('buttons.github')"
            @click="() => trackClick('click_github', { section: 'hero' })"
          >
            <GithubIcon class="h-5 w-5" />
          </a>
          <a
            :href="contact.linkedinUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="social"
            :aria-label="t('buttons.linkedin')"
            @click="() => trackClick('click_linkedin', { section: 'hero' })"
          >
            <LinkedinIcon class="h-5 w-5" />
          </a>
        </div>

        <p class="hero-in mt-10 flex items-center gap-2.5 text-sm text-muted" style="--d: 340ms">
          <span class="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true"></span>
          {{ t('about.available') }} · {{ t('about.location') }}
        </p>
      </div>

    </div>
  </section>
</template>

<style scoped>
.social {
  @apply flex h-10 w-10 items-center justify-center rounded-full text-muted transition duration-300 hover:text-ink;
}
.social:hover {
  background: rgb(var(--ink) / 0.06);
}

/* One authored entrance: fade in while the blur resolves, staggered. */
.hero-in {
  animation: hero-in 1s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--d, 0ms);
}
@keyframes hero-in {
  from {
    opacity: 0;
    filter: blur(10px);
    transform: translateY(14px);
  }
}

/* On the way out the hero recedes, so the projects feel like the next layer. */
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .hero-content {
      animation: hero-out linear both;
      animation-timeline: view();
      animation-range: exit 10% exit 90%;
    }
    @keyframes hero-out {
      to {
        opacity: 0;
        transform: translateY(-40px) scale(0.97);
        filter: blur(6px);
      }
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-in {
    animation: none;
  }
}
</style>
