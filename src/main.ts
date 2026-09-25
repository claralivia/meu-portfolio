import { createApp } from 'vue'
import App from './App.vue'
import { i18n } from './i18n'
import { router } from './router'
import { vReveal } from './directives/reveal'
import './index.css'
import './types/global.d.ts'

const app = createApp(App)

app.use(i18n)
app.use(router)
app.directive('reveal', vReveal)
app.mount('#app')
