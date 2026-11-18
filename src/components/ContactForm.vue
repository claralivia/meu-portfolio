<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAnalytics } from '../composables/useAnalytics'

const { t } = useI18n()
const { trackClick } = useAnalytics()

type Status = 'idle' | 'sending' | 'success' | 'error'

const name = ref('')
const email = ref('')
const message = ref('')
const status = ref<Status>('idle')

const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY as string | undefined

const submit = async () => {
  if (!accessKey) {
    status.value = 'error'
    return
  }

  status.value = 'sending'

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: accessKey,
        subject: `Novo contato pelo portfólio - ${name.value}`,
        name: name.value,
        email: email.value,
        message: message.value,
      }),
    })

    const result = await response.json()
    status.value = result.success ? 'success' : 'error'
    trackClick('submit_contact_form', { status: status.value })

    if (result.success) {
      name.value = ''
      email.value = ''
      message.value = ''
    }
  } catch {
    status.value = 'error'
    trackClick('submit_contact_form', { status: 'error' })
  }
}
</script>

<template>
  <form class="relative flex w-full flex-col gap-3 text-left" :class="{ 'is-sent': status === 'success' }" @submit.prevent="submit">
    <p class="hint flex items-center gap-2 text-sm text-muted">
      <svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 2.5h4v3l1.6 2.4V19a2 2 0 0 1-2 2h-3.2a2 2 0 0 1-2-2V7.9L10 5.5z" /><path d="M9 12h6" /></svg>
      {{ t('contact.form.hint') }}
    </p>
    <label for="contact-name" class="sr-only">{{ t('contact.form.name') }}</label>
    <input id="contact-name" v-model="name" type="text" required autocomplete="name" :placeholder="t('contact.form.name')" class="field" />

    <label for="contact-email" class="sr-only">{{ t('contact.form.email') }}</label>
    <input id="contact-email" v-model="email" type="email" required autocomplete="email" :placeholder="t('contact.form.email')" class="field" />

    <label for="contact-message" class="sr-only">{{ t('contact.form.message') }}</label>
    <textarea id="contact-message" v-model="message" required rows="5" :placeholder="t('contact.form.message')" class="field resize-none"></textarea>

    <!-- On success the message is rolled up, corked and set adrift. -->
    <svg v-if="status === 'success'" class="bottle" viewBox="0 0 64 120" aria-hidden="true">
      <rect x="22" y="2" width="20" height="14" rx="4" fill="#c98a4b" />
      <path d="M24 16h16v14c0 6 12 10 12 24v52a10 10 0 0 1-10 10H22a10 10 0 0 1-10-10V54c0-14 12-18 12-24z" fill="#9fe3ee" fill-opacity="0.55" stroke="#fff" stroke-width="2.4" />
      <rect x="24" y="60" width="16" height="42" rx="3" fill="#fff4dc" transform="rotate(-6 32 80)" />
      <path d="M27 70h10M27 77h10M27 84h7" stroke="#c98a4b" stroke-width="1.6" stroke-linecap="round" transform="rotate(-6 32 80)" />
    </svg>

    <div class="mt-2 flex flex-wrap items-center gap-4">
      <button type="submit" :disabled="status === 'sending'" class="pill-solid disabled:pointer-events-none disabled:opacity-60">
        {{ status === 'sending' ? t('contact.form.sending') : t('contact.form.send') }}
      </button>
      <p v-if="status === 'success'" role="status" class="text-sm text-emerald-700 dark:text-emerald-400">{{ t('contact.form.success') }}</p>
      <p v-if="status === 'error'" role="alert" class="text-sm text-red-700 dark:text-red-400">{{ t('contact.form.error') }}</p>
    </div>
  </form>
</template>

<style scoped>
.field {
  @apply w-full rounded-xl px-4 py-3 text-[15px] text-ink outline-none transition duration-300 placeholder:text-muted;
  background: rgb(var(--ink) / 0.05);
  box-shadow: inset 0 0 0 1px transparent;
}
.field:hover {
  background: rgb(var(--ink) / 0.07);
}
.field:focus {
  background: rgb(var(--ink) / 0.04);
  box-shadow: inset 0 0 0 1.5px rgb(var(--accent));
}
.is-sent .field {
  animation: letter-out 0.9s cubic-bezier(0.55, 0, 0.9, 0.4) forwards;
}
@keyframes letter-out {
  to {
    opacity: 0;
    transform: translateY(-14px) scale(0.92);
  }
}
.bottle {
  position: absolute;
  left: 50%;
  top: 38%;
  width: 54px;
  margin-left: -27px;
  pointer-events: none;
  filter: drop-shadow(0 10px 8px rgb(0 20 50 / 0.35));
  animation: bottle-away 5.5s cubic-bezier(0.45, 0.05, 0.4, 1) 0.7s forwards;
  opacity: 0;
}
@keyframes bottle-away {
  0% {
    opacity: 0;
    transform: translate(0, -20px) rotate(0deg) scale(0.6);
  }
  10% {
    opacity: 1;
    transform: translate(0, 0) rotate(-8deg) scale(1);
  }
  35% {
    transform: translate(60px, 8px) rotate(72deg);
  }
  60% {
    transform: translate(150px, -6px) rotate(80deg);
  }
  85% {
    opacity: 1;
    transform: translate(260px, 6px) rotate(86deg);
  }
  100% {
    opacity: 0;
    transform: translate(340px, 0) rotate(88deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .is-sent .field,
  .bottle {
    animation: none;
  }
  .bottle {
    opacity: 1;
  }
}
</style>
