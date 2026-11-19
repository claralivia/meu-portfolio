import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

/**
 * Small surprises for people who explore. Type "sol" anywhere on the page and it
 * turns to sunset for a few seconds; type "cafe" and you get a cup of coffee.
 * Nothing runs until a key is pressed, so it costs nothing the rest of the time.
 */
export function useSecrets() {
  const { t } = useI18n()
  const toast = ref('')

  let buffer = ''
  let toastTimer = 0
  let moodTimer = 0

  const say = (message: string) => {
    toast.value = message
    window.clearTimeout(toastTimer)
    toastTimer = window.setTimeout(() => (toast.value = ''), 2600)
  }

  const sunset = () => {
    const root = document.documentElement
    window.clearTimeout(moodTimer)
    if (root.dataset.mood === 'sunset') {
      delete root.dataset.mood
      return
    }
    root.dataset.mood = 'sunset'
    say(t('secrets.sunset'))
    moodTimer = window.setTimeout(() => delete root.dataset.mood, 12000)
  }

  const onKey = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement | null
    if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return
    if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return
    buffer = (buffer + e.key.toLowerCase()).slice(-6)
    if (buffer.endsWith('sol')) {
      buffer = ''
      sunset()
    } else if (buffer.endsWith('cafe')) {
      buffer = ''
      say(t('secrets.coffee'))
    }
  }

  onMounted(() => window.addEventListener('keydown', onKey))
  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKey)
    window.clearTimeout(toastTimer)
    window.clearTimeout(moodTimer)
    delete document.documentElement.dataset.mood
  })

  return { toast }
}
