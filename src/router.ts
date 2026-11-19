import { nextTick } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'

const SCROLL_OFFSET = 24

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/sobre', name: 'about', component: () => import('./views/AboutView.vue') },
    { path: '/projetos/:slug', name: 'project', component: () => import('./views/ProjectView.vue') },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('./views/NotFoundView.vue') },
  ],
  // Between pages the new page opens already where it should be (instant, hidden behind the page
  // transition) instead of starting at the top and sliding down. Only moves inside one page glide.
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return { ...savedPosition, behavior: 'instant' }
    const samePage = to.path === from.path
    if (to.hash) {
      if (samePage) return { el: to.hash, top: SCROLL_OFFSET, behavior: 'smooth' }
      return new Promise((resolve) => setTimeout(() => resolve({ el: to.hash, top: SCROLL_OFFSET, behavior: 'instant' }), 0))
    }
    return { top: 0, behavior: 'instant' }
  },
})

// Page changes go through the View Transitions API where it exists: the old page and the new
// one cross-fade, and a project picture (named "project-shot") grows into the case study.
// Anywhere else the page just changes. The page is only held while the new one renders, and it
// is put in its place (top, or the section asked for) before it is shown.
type Doc = Document & { startViewTransition?: (update: () => Promise<void> | void) => unknown }
let release: (() => void) | null = null
let safety = 0
let landing = ''

const settle = () => {
  window.clearTimeout(safety)
  const done = release
  release = null
  if (!done) return
  nextTick(() => {
    const el = landing ? document.querySelector(landing) : null
    const top = el ? el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET : 0
    window.scrollTo({ top, behavior: 'instant' })
    landing = ''
    done()
  })
}

router.beforeResolve(async (to, from) => {
  const doc = document as Doc
  landing = ''
  if (!doc.startViewTransition || !from.name || to.path === from.path) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  landing = to.hash
  await new Promise<void>((ready) => {
    doc.startViewTransition!(() => {
      ready()
      return new Promise<void>((done) => {
        release = done
        safety = window.setTimeout(settle, 700)
      })
    })
  })
})
router.afterEach(settle)
router.onError(settle)
