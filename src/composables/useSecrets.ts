import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

/**
 * Small surprises for people who explore. Each one is counted, and the count sits in the
 * side rail ("2/5") without saying where they are. Nothing runs until a key is pressed or
 * something is touched, so it costs nothing the rest of the time.
 */
export const SECRETS = ['sunset', 'coffee', 'flip', 'copy', 'start'] as const
export type SecretId = (typeof SECRETS)[number]

const STORAGE_KEY = 'secrets-found'
const found = ref<SecretId[]>([])
const toast = ref('')
let toastTimer = 0
let loaded = false

const load = () => {
  if (loaded) return
  loaded = true
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as SecretId[]
    found.value = saved.filter((id) => SECRETS.includes(id))
  } catch {
    /* private window or blocked storage: the count just starts over */
  }
}

const say = (message: string) => {
  toast.value = message
  window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => (toast.value = ''), 2800)
}

/** Shared by every component: the count, the toast and a way to report a discovery. */
export function useFound() {
  const { t } = useI18n()
  load()

  const count = computed(() => found.value.length)

  /** Marks a secret as found. Returns true the first time, and says so out loud. */
  const discover = (id: SecretId, message?: string) => {
    if (found.value.includes(id)) {
      if (message) say(message)
      return false
    }
    found.value = [...found.value, id]
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(found.value))
    } catch {
      /* ignore */
    }
    const done = found.value.length === SECRETS.length
    say(done ? t('secrets.all') : `${message ? message + ' · ' : ''}${t('secrets.found', { n: found.value.length, total: SECRETS.length })}`)
    return true
  }

  return { found, count, total: SECRETS.length, toast, say, discover }
}

/** Listens for the typed secrets ("sol", "cafe"). Used once, in App. */
export function useSecrets() {
  const { t } = useI18n()
  const { toast: message, discover, say } = useFound()

  let buffer = ''
  let moodTimer = 0

  const sunset = () => {
    const root = document.documentElement
    window.clearTimeout(moodTimer)
    if (root.dataset.mood === 'sunset') {
      delete root.dataset.mood
      return
    }
    root.dataset.mood = 'sunset'
    discover('sunset', t('secrets.sunset'))
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
      discover('coffee', t('secrets.coffee'))
    }
  }

  onMounted(() => window.addEventListener('keydown', onKey))
  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKey)
    window.clearTimeout(moodTimer)
    delete document.documentElement.dataset.mood
  })

  return { toast: message, say }
}
