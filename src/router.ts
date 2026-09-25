import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'

const NAVBAR_OFFSET = 96

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/sobre', name: 'about', component: () => import('./views/AboutView.vue') },
    { path: '/projetos/:slug', name: 'project', component: () => import('./views/ProjectView.vue') },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('./views/NotFoundView.vue') },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) {
      // Coming from another page the section isn't rendered yet, so wait a tick.
      const delay = to.name === from.name ? 0 : 80
      return new Promise((resolve) =>
        setTimeout(() => resolve({ el: to.hash, top: NAVBAR_OFFSET, behavior: 'smooth' }), delay)
      )
    }
    return { top: 0 }
  },
})
