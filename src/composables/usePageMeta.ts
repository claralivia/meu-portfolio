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

export function usePageMeta(meta: () => { title: string; description: string; path?: string }) {
  const { locale } = useI18n()

  watchEffect(() => {
    if (typeof document === 'undefined') return
    const { title, description, path = '/' } = meta()

    document.documentElement.lang = locale.value === 'pt' ? 'pt-BR' : locale.value
    document.title = title

    setMeta('description', description)
    setMeta('og:title', title, true)
    setMeta('og:description', description, true)
    setMeta('og:type', 'website', true)
    setMeta('og:url', `${BASE_URL}${path}`, true)
    setMeta('og:image', `${BASE_URL}/og-image.png`, true)
    setMeta('twitter:card', 'summary_large_image')
  })
}
