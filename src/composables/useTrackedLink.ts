import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAnalytics } from './useAnalytics'

// Personalised links: share claralivia.dev/?r=<code> with someone and get notified
// when it's opened. The code is opaque on purpose — only the site owner knows who
// received which code, so no names end up in URLs or in the bundle.
const PARAM = 'r'
const SESSION_KEY = 'tracked-link-sent'

const readSent = (): string[] => {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? '[]')
  } catch {
    return []
  }
}

const markSent = (code: string) => {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify([...readSent(), code]))
  } catch {
    // Private mode / blocked storage: worst case a reload notifies twice.
  }
}

const notifyByEmail = async (code: string, page: string) => {
  const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY as string | undefined
  if (!accessKey) return

  const openedAt = new Date().toLocaleString('pt-BR', { timeZone: 'America/Fortaleza' })
  const device = window.matchMedia('(pointer: coarse)').matches ? 'celular/tablet' : 'computador'

  await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      access_key: accessKey,
      subject: `Link personalizado aberto: ${code}`,
      from_name: 'Portfólio claralivia.dev',
      message: [
        `Código: ${code}`,
        `Página: ${page}`,
        `Quando: ${openedAt}`,
        `Dispositivo: ${device}`,
        `Idioma do navegador: ${navigator.language}`,
      ].join('\n'),
    }),
  })
}

export function useTrackedLink() {
  const router = useRouter()
  const { trackClick } = useAnalytics()

  onMounted(async () => {
    await router.isReady()
    const route = router.currentRoute.value
    const raw = route.query[PARAM]
    const code = typeof raw === 'string' ? raw.trim().slice(0, 40) : ''
    if (!code) return

    // Drop the code from the address bar so reloads and copied URLs stay clean.
    const query = { ...route.query }
    delete query[PARAM]
    router.replace({ query, hash: route.hash })

    if (readSent().includes(code)) return
    markSent(code)

    trackClick('tracked_link_open', { code, page: route.path })
    try {
      await notifyByEmail(code, route.path)
    } catch {
      // Notification is best-effort; the analytics event above still lands.
    }
  })
}
