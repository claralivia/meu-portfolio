import { watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'

const BASE_URL = 'https://claralivia.dev'

const setMeta = (name: string, content: string, isProperty = false) => {
  const attr = isProperty ? 'property' : 'name'
  let el = document.querySelector(`meta[${attr}="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

const setCanonical = (href: string) => {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.rel = 'canonical'
    document.head.appendChild(el)
  }
  el.href = href
}

// Keeps per-route tags right for Google, which renders JavaScript. Link previews
// (WhatsApp, LinkedIn) don't run JS and read the static tags in index.html instead.
export function usePageMeta(meta: () => { title: string; description: string; path?: string }) {
  const { locale } = useI18n()

  watchEffect(() => {
    if (typeof document === 'undefined') return
    const { title, description, path = '/' } = meta()
    const url = `${BASE_URL}${path}`

    document.documentElement.lang = locale.value === 'pt' ? 'pt-BR' : locale.value
    document.title = title

    setCanonical(url)
    setMeta('description', description)
    setMeta('og:title', title, true)
    setMeta('og:description', description, true)
    setMeta('og:url', url, true)
    setMeta('og:locale', locale.value === 'pt' ? 'pt_BR' : 'en_US', true)
    setMeta('twitter:title', title)
    setMeta('twitter:description', description)
  })
}
