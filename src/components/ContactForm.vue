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
  <form class="w-full max-w-xl mx-auto mb-10 flex flex-col gap-4 text-left" @submit.prevent="submit">
    <div>
      <label for="contact-name" class="sr-only">{{ t('contact.form.name') }}</label>
      <input
        id="contact-name"
        v-model="name"
        type="text"
        required
        :placeholder="t('contact.form.name')"
        class="form-input"
      />
    </div>

    <div>
      <label for="contact-email" class="sr-only">{{ t('contact.form.email') }}</label>
      <input
        id="contact-email"
        v-model="email"
        type="email"
        required
        :placeholder="t('contact.form.email')"
        class="form-input"
      />
    </div>

    <div>
      <label for="contact-message" class="sr-only">{{ t('contact.form.message') }}</label>
      <textarea
        id="contact-message"
        v-model="message"
        required
        rows="5"
        :placeholder="t('contact.form.message')"
        class="form-input resize-none"
      ></textarea>
    </div>

    <button
      type="submit"
      :disabled="status === 'sending'"
      class="flex items-center justify-center gap-2 font-medium py-3 px-6 rounded-2xl bg-gradient-to-br from-white/50 to-white/20 dark:from-white/10 dark:to-white/5 border border-white/50 dark:border-white/10 backdrop-blur-lg shadow-lg shadow-black/5 dark:shadow-black/20 hover:shadow-xl hover:from-white/60 hover:to-white/30 dark:hover:from-white/20 dark:hover:to-white/10 hover:-translate-y-1 transition-all duration-300 text-neutral-900 dark:text-white disabled:opacity-60 disabled:pointer-events-none disabled:translate-y-0"
    >
      {{ status === 'sending' ? t('contact.form.sending') : t('contact.form.send') }}
    </button>

    <p v-if="status === 'success'" class="text-emerald-600 dark:text-emerald-400 text-sm text-center">
      {{ t('contact.form.success') }}
    </p>
    <p v-if="status === 'error'" class="text-red-600 dark:text-red-400 text-sm text-center">
      {{ t('contact.form.error') }}
    </p>
  </form>
</template>

<style scoped>
.form-input {
  @apply w-full py-3 px-4 rounded-2xl bg-gradient-to-br from-white/50 to-white/20 dark:from-white/10 dark:to-white/5 border border-white/50 dark:border-white/10 backdrop-blur-lg shadow-inner shadow-black/5 dark:shadow-black/20 text-neutral-900 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-gray-400 outline-none focus:border-blue-500/60 dark:focus:border-blue-400/60 transition-all duration-300;
}
</style>
