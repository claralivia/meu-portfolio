<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useScrollLock, useWindowSize } from '@vueuse/core'
import { SunIcon, MoonIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { useAnalytics } from '../composables/useAnalytics'
import { useTheme } from '../composables/useTheme'
import { useCommandPalette } from '../composables/useCommandPalette'
import { useFound } from '../composables/useSecrets'

type Key = 'home' | 'projects' | 'experience' | 'contact'
interface Item {
  key: Key
  to: string
}

// The page is a column of numbered stops. The line between them fills as you move down.
const items: Item[] = [
  { key: 'home', to: '/' },
  { key: 'projects', to: '/#projects' },
  { key: 'experience', to: '/#experience' },
  { key: 'contact', to: '/#contact' },
]

const { t, locale } = useI18n()
const route = useRoute()
const { trackClick } = useAnalytics()
const { isDark, toggleDark } = useTheme()
const palette = useCommandPalette()
const { count, total } = useFound()
const isOpen = ref(false)

const isLocked = useScrollLock(typeof document !== 'undefined' ? document.body : null)
const { width } = useWindowSize()
watch(isOpen, (open) => (isLocked.value = open))
watch(width, (w) => {
  if (w >= 768) isOpen.value = false
})

// On the home page the stop for the section in the middle of the screen is lit.
const section = ref('about')
let observer: IntersectionObserver | null = null
const observe = async () => {
  observer?.disconnect()
  section.value = 'about'
  if (route.name !== 'home') return
  await nextTick()
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) if (entry.isIntersecting) section.value = entry.target.id
    },
    { rootMargin: '-45% 0px -50% 0px' }
  )
  for (const id of ['about', 'projects', 'experience', 'contact']) {
    const el = document.getElementById(id)
    if (el) observer.observe(el)
  }
}
watch(() => [route.name, route.fullPath], observe, { immediate: true })
onUnmounted(() => observer?.disconnect())

// "Sobre" is not one of the numbered stops: it is the riddle under them.
const onAbout = computed(() => route.name === 'about')
const activeKey = computed<Key | ''>(() => {
  if (route.name !== 'home') return ''
  return section.value === 'about' ? 'home' : (section.value as Key)
})
const activeIndex = computed(() => Math.max(items.findIndex((i) => i.key === activeKey.value), 0))
const progress = computed(() => (activeKey.value ? activeIndex.value / (items.length - 1) : 0))

const number = (i: number) => String(i + 1).padStart(2, '0')
const go = (key: string) => {
  trackClick('click_nav', { link: key })
  isOpen.value = false
}
const toggleLocale = () => {
  locale.value = locale.value === 'pt' ? 'en' : 'pt'
  trackClick('click_toggle_locale', { locale: locale.value })
}
const switchTheme = () => {
  toggleDark()
  trackClick('click_toggle_theme', { theme: isDark.value ? 'dark' : 'light' })
}
const openPalette = () => {
  isOpen.value = false
  palette.open()
  trackClick('open_command_palette', { source: 'rail' })
}
</script>

<template>
  <header>
    <!-- Desktop: a thin column on the left. -->
    <nav class="rail hidden md:flex" :aria-label="t('navbar.menu')">
      <RouterLink to="/" class="mark" aria-label="Clara Lívia" @click="() => go('mark')">C<span>.</span></RouterLink>

      <div class="mid">
      <ol class="items" :style="{ '--p': progress }">
        <li v-for="(item, i) in items" :key="item.key">
          <RouterLink :to="item.to" class="item" :class="{ 'is-on': item.key === activeKey }" :aria-current="item.key === activeKey ? 'true' : undefined" @click="() => go(item.key)">
            <span class="num">{{ number(i) }}</span>
            <span class="label">{{ t(`navbar.${item.key}`) }}</span>
          </RouterLink>
        </li>
      </ol>

        <RouterLink to="/sobre" class="riddle" :class="{ 'is-on': onAbout }" :aria-current="onAbout ? 'page' : undefined" :aria-label="t('navbar.about')" @click="() => go('about')">
          ?<span class="label">{{ t('navbar.about') }}</span>
        </RouterLink>
      </div>

      <div class="tools">
        <span class="found" :title="t('navbar.secrets')" :aria-label="`${t('navbar.secrets')}: ${count}/${total}`">{{ count }}/{{ total }}</span>
        <button class="tool" :aria-label="t('navbar.search')" @click="openPalette"><MagnifyingGlassIcon class="h-[18px] w-[18px]" /></button>
        <button class="tool" :aria-label="t('navbar.toggleTheme')" @click="switchTheme">
          <MoonIcon v-if="isDark" class="h-[18px] w-[18px]" />
          <SunIcon v-else class="h-[18px] w-[18px]" />
        </button>
        <button class="tool text-xs font-semibold" :aria-label="t('navbar.changeLanguage')" @click="toggleLocale">{{ locale.toUpperCase() }}</button>
      </div>
    </nav>

    <!-- Phone: the name at the top (it scrolls away) and one round button that opens the index. -->
    <RouterLink v-if="route.name !== 'home'" to="/" class="m-mark md:hidden" aria-label="Clara Lívia" @click="() => go('mark')">Clara Lívia<span>.</span></RouterLink>
    <button class="fab md:hidden" :aria-label="isOpen ? t('navbar.closeMenu') : t('navbar.openMenu')" :aria-expanded="isOpen" @click="isOpen = !isOpen">
      <XMarkIcon v-if="isOpen" class="h-5 w-5" />
      <span v-else class="fab-count">{{ onAbout ? '?' : number(activeIndex) }}</span>
    </button>

    <Transition name="sheet">
      <nav v-if="isOpen" class="sheet md:hidden" :aria-label="t('navbar.menu')">
        <ol>
          <li v-for="(item, i) in items" :key="item.key">
            <RouterLink :to="item.to" class="sheet-link" :class="{ 'is-on': item.key === activeKey }" @click="() => go(item.key)">
              <span class="sheet-num">{{ number(i) }}</span>
              {{ t(`navbar.${item.key}`) }}
            </RouterLink>
          </li>
        </ol>
        <RouterLink to="/sobre" class="sheet-riddle" :class="{ 'is-on': onAbout }" @click="() => go('about')">
          <span class="sheet-num">?</span>
          {{ t('navbar.about') }}
        </RouterLink>
        <div class="sheet-tools">
          <button class="tool" :aria-label="t('navbar.search')" @click="openPalette"><MagnifyingGlassIcon class="h-5 w-5" /></button>
          <button class="tool" :aria-label="t('navbar.toggleTheme')" @click="switchTheme">
            <MoonIcon v-if="isDark" class="h-5 w-5" />
            <SunIcon v-else class="h-5 w-5" />
          </button>
          <button class="tool text-sm font-semibold" :aria-label="t('navbar.changeLanguage')" @click="toggleLocale">{{ locale.toUpperCase() }}</button>
          <span class="found ml-auto">{{ t('navbar.secrets') }} {{ count }}/{{ total }}</span>
        </div>
      </nav>
    </Transition>
  </header>
</template>

<style scoped>
.rail {
  view-transition-name: rail;
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 40;
  width: 4.5rem;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 0;
  border-right: 1px solid var(--line);
  background: rgb(var(--surface));
}
.mark {
  font-family: theme('fontFamily.display');
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.05em;
  color: rgb(var(--ink));
}
.mid {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.9rem;
}
.riddle {
  position: relative;
  display: flex;
  height: 1.8rem;
  width: 1.8rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  border: 1px dashed rgb(var(--muted));
  font-size: 0.85rem;
  font-weight: 700;
  color: rgb(var(--muted));
  transition:
    color 0.25s ease,
    background-color 0.25s ease,
    transform 0.25s ease;
}
.riddle:hover {
  color: rgb(var(--ink));
  transform: scale(1.12);
}
.riddle.is-on {
  border-style: solid;
  border-color: rgb(var(--accent));
  background: rgb(var(--accent));
  color: rgb(var(--surface));
}
.riddle:hover .label,
.riddle:focus-visible .label {
  opacity: 1;
  translate: 0 0;
}
.mark span,
.m-mark span {
  color: rgb(var(--accent));
}

/* The stops and the line between them. */
.items {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.9rem;
}
.items::before,
.items::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 0.9rem;
  bottom: 0.9rem;
  width: 1px;
  translate: -50% 0;
}
.items::before {
  background: var(--line);
}
.items::after {
  background: rgb(var(--ink));
  transform-origin: top;
  transform: scaleY(var(--p, 0));
  transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}
.item {
  position: relative;
  z-index: 1;
  display: flex;
  height: 1.8rem;
  width: 1.8rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: rgb(var(--muted));
  background: rgb(var(--surface));
  transition:
    color 0.25s ease,
    background-color 0.25s ease,
    transform 0.25s ease;
}
.item:hover {
  color: rgb(var(--ink));
  transform: scale(1.15);
}
.item.is-on {
  color: rgb(var(--surface));
  background: rgb(var(--accent));
}
.label {
  position: absolute;
  left: calc(100% + 0.75rem);
  border-radius: 9999px;
  padding: 0.25rem 0.8rem;
  font-size: 0.85rem;
  white-space: nowrap;
  background: rgb(var(--ink));
  color: rgb(var(--surface));
  opacity: 0;
  translate: -6px 0;
  pointer-events: none;
  transition:
    opacity 0.2s ease,
    translate 0.2s ease;
}
.item:hover .label,
.item:focus-visible .label {
  opacity: 1;
  translate: 0 0;
}

.tools {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}
.found {
  margin-bottom: 0.4rem;
  font-size: 0.78rem;
  animation: nudge 1.1s ease 1.8s 1 both;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: rgb(var(--accent));
}
@keyframes nudge {
  40% {
    transform: scale(1.5);
  }
}
.tool {
  display: flex;
  height: 2.25rem;
  width: 2.25rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  color: rgb(var(--muted));
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}
.tool:hover {
  color: rgb(var(--ink));
  background: rgb(var(--ink) / 0.06);
}

/* Phone */
.m-mark {
  position: absolute;
  left: 1.5rem;
  top: 1.25rem;
  z-index: 30;
  font-family: theme('fontFamily.display');
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: rgb(var(--ink));
}
.fab {
  view-transition-name: fab;
  position: fixed;
  right: 1.1rem;
  bottom: 1.1rem;
  z-index: 60;
  display: flex;
  height: 3.1rem;
  width: 3.1rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: rgb(var(--ink));
  color: rgb(var(--surface));
}
.fab-count {
  font-size: 0.85rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.sheet {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2rem;
  padding: 1.5rem;
  background: rgb(var(--surface));
}
.sheet-link {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  padding: 0.35rem 0;
  font-family: theme('fontFamily.display');
  font-size: 2.6rem;
  font-weight: 700;
  letter-spacing: -0.04em;
  color: rgb(var(--ink));
}
.sheet-link.is-on {
  color: rgb(var(--accent));
}
.sheet-riddle {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  margin-top: -1rem;
  font-size: 1.1rem;
  font-weight: 500;
  color: rgb(var(--muted));
}
.sheet-riddle.is-on {
  color: rgb(var(--accent));
}
.sheet-num {
  width: 1.8rem;
  font-family: theme('fontFamily.sans');
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0;
  color: rgb(var(--muted));
}
.sheet-tools {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding-top: 1rem;
  border-top: 1px solid var(--line);
}
.sheet-tools .found {
  margin: 0;
  font-size: 0.8rem;
}
@media (min-width: 768px) {
  .fab,
  .sheet {
    display: none;
  }
}
.sheet-enter-active,
.sheet-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
  transform: translateY(16px);
}
@media (prefers-reduced-motion: reduce) {
  .items::after,
  .sheet-enter-active,
  .sheet-leave-active {
    transition: none;
  }
}
</style>
