<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowUpRightIcon } from '@heroicons/vue/24/outline'
import ContactForm from './ContactForm.vue'
import { useAnalytics } from '../composables/useAnalytics'

const { t, tm } = useI18n()
// tm, not t: vue-i18n reads the @ in an e-mail address as message syntax.
const contact = computed(() => tm('contact') as { email: string; linkedinUrl: string; githubUrl: string })
const { trackClick } = useAnalytics()
</script>

<template>
  <section id="contact" class="py-20 sm:py-28">
    <!-- The glass behind this panel is the StageFrame (App level), which becomes it. -->
    <div id="contact-slot" class="grid gap-10 rounded-2xl p-6 sm:p-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:p-14">
      <div v-reveal="250" class="min-w-0">
        <!-- The portrait lands here, closing the loop that started in the hero. -->
        <div id="contact-avatar" class="mb-6 h-16 w-16 rounded-full" aria-hidden="true"></div>
        <h2 class="section-title !text-4xl sm:!text-5xl">{{ t('contact.title') }}</h2>
        <p class="mt-5 max-w-[38ch] text-lg leading-relaxed text-muted">{{ t('contact.description') }}</p>

        <a
          :href="`mailto:${contact.email}`"
          class="mt-8 inline-block break-all text-xl font-medium text-accent underline-offset-4 hover:underline sm:text-2xl"
          @click="() => trackClick('click_email')"
        >
          {{ contact.email }}
        </a>

        <ul class="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
          <li>
            <a
              :href="contact.linkedinUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 text-muted transition-colors hover:text-ink"
              @click="() => trackClick('click_linkedin', { section: 'contact' })"
            >
              LinkedIn <ArrowUpRightIcon class="h-3.5 w-3.5" />
            </a>
          </li>
          <li>
            <a
              :href="contact.githubUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 text-muted transition-colors hover:text-ink"
              @click="() => trackClick('click_github', { section: 'contact' })"
            >
              GitHub <ArrowUpRightIcon class="h-3.5 w-3.5" />
            </a>
          </li>
        </ul>
      </div>

      <ContactForm v-reveal="380" />
    </div>
  </section>
</template>
