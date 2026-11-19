<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowUpRightIcon } from '@heroicons/vue/24/outline'
import ContactForm from './ContactForm.vue'
import { useAnalytics } from '../composables/useAnalytics'
import { useFound } from '../composables/useSecrets'

const { t, tm } = useI18n()
const { trackClick } = useAnalytics()
const { discover } = useFound()
// tm, not t: vue-i18n reads the @ in an e-mail address as message syntax.
const contact = computed(() => tm('contact') as { email: string; linkedinUrl: string; githubUrl: string })

// The e-mail address is a button: one press copies it.
const copied = ref(false)
let timer = 0
const copy = async () => {
  trackClick('copy_email')
  try {
    await navigator.clipboard.writeText(contact.value.email)
    copied.value = true
    discover('copy', t('secrets.copy'))
    window.clearTimeout(timer)
    timer = window.setTimeout(() => (copied.value = false), 1800)
  } catch {
    window.location.href = `mailto:${contact.value.email}`
  }
}
onBeforeUnmount(() => window.clearTimeout(timer))
</script>

<template>
  <section id="contact" class="py-20 md:py-28">
    <div class="grid gap-14 md:grid-cols-2 md:gap-20">
      <div v-reveal>
        <h2 class="section-title">{{ t('contact.title') }}</h2>
        <p class="mt-4 max-w-[36ch] text-lg text-muted">{{ t('contact.description') }}</p>

        <button type="button" class="mail" :aria-label="t('contact.copy')" @click="copy">
          <span class="mail-address">{{ contact.email }}</span>
          <span class="chip" :class="{ 'is-on': copied }" aria-live="polite">{{ copied ? t('contact.copied') : t('contact.copy') }}</span>
        </button>

        <ul class="mt-6 flex gap-6 text-[15px]">
          <li>
            <a
              :href="contact.linkedinUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="link"
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
              class="link"
              @click="() => trackClick('click_github', { section: 'contact' })"
            >
              GitHub <ArrowUpRightIcon class="h-3.5 w-3.5" />
            </a>
          </li>
        </ul>
      </div>

      <ContactForm v-reveal="120" />
    </div>
  </section>
</template>

<style scoped>
.mail {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem 0.9rem;
  margin-top: 2rem;
  text-align: left;
}
.mail-address {
  font-family: theme('fontFamily.display');
  font-size: clamp(1.4rem, 3.4vw, 1.9rem);
  font-weight: 600;
  letter-spacing: -0.02em;
  word-break: break-all;
  color: rgb(var(--ink));
  text-decoration: underline;
  text-decoration-color: var(--line);
  text-underline-offset: 6px;
  transition: text-decoration-color 0.2s ease;
}
.mail:hover .mail-address {
  text-decoration-color: rgb(var(--accent));
}
.link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: rgb(var(--muted));
  transition: color 0.2s ease;
}
.link:hover {
  color: rgb(var(--ink));
}
</style>
