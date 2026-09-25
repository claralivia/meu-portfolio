import type { Directive } from 'vue'

// One shared observer for every revealed element. threshold 0 + a bottom inset
// means tall sections on phones still trigger (a ratio threshold never did),
// and once visible an element stays visible.
let observer: IntersectionObserver | null = null

const getObserver = () => {
  if (observer) return observer
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        // Also reveal anything already scrolled past (anchor jumps, fast flings).
        if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
          entry.target.classList.add('is-visible')
          observer?.unobserve(entry.target)
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0 }
  )
  return observer
}

export const vReveal: Directive<HTMLElement, number | undefined> = {
  mounted(el, { value }) {
    el.classList.add('reveal')
    if (value) el.style.setProperty('--reveal-delay', `${value}ms`)

    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-visible')
      return
    }
    document.documentElement.classList.add('reveal-ready')
    getObserver().observe(el)
  },
  unmounted(el) {
    observer?.unobserve(el)
  },
}
