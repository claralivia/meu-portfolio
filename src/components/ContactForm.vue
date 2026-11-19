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
  <form class="flex w-full flex-col gap-3 text-left" @submit.prevent="submit">
    <p class="text-sm text-muted">{{ t('contact.form.hint') }}</p>

    <label for="contact-name" class="sr-only">{{ t('contact.form.name') }}</label>
    <input id="contact-name" v-model="name" type="text" required autocomplete="name" :placeholder="t('contact.form.name')" class="field" />

    <label for="contact-email" class="sr-only">{{ t('contact.form.email') }}</label>
    <input id="contact-email" v-model="email" type="email" required autocomplete="email" :placeholder="t('contact.form.email')" class="field" />

    <label for="contact-message" class="sr-only">{{ t('contact.form.message') }}</label>
    <textarea id="contact-message" v-model="message" required rows="5" :placeholder="t('contact.form.message')" class="field resize-none"></textarea>

    <div class="mt-1 flex flex-wrap items-center gap-4">
      <button type="submit" :disabled="status === 'sending'" class="pill-solid disabled:pointer-events-none disabled:opacity-60">
        {{ status === 'sending' ? t('contact.form.sending') : t('contact.form.send') }}
      </button>
      <p v-if="status === 'success'" role="status" class="text-sm text-ink">{{ t('contact.form.success') }}</p>
      <p v-if="status === 'error'" role="alert" class="text-sm text-red-700 dark:text-red-400">{{ t('contact.form.error') }}</p>
    </div>
  </form>
</template>

<style scoped>
.field {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid var(--line);
  background: transparent;
  padding: 0.8rem 1rem;
  font-size: 16px;
  color: rgb(var(--ink));
  outline: none;
  transition: border-color 0.2s ease;
}
.field::placeholder {
  color: rgb(var(--muted));
}
.field:hover {
  border-color: rgb(var(--muted) / 0.6);
}
.field:focus {
  border-color: rgb(var(--ink));
}
</style>
