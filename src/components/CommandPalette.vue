<script setup lang="ts">
import { computed, nextTick, ref, watch, type Component } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { onKeyStroke, useScrollLock } from '@vueuse/core'
import {
  MagnifyingGlassIcon,
  HashtagIcon,
  FolderIcon,
  EnvelopeIcon,
  SunIcon,
  MoonIcon,
  LanguageIcon,
  ArrowTopRightOnSquareIcon,
  UserIcon,
} from '@heroicons/vue/24/outline'
import { useCommandPalette } from '../composables/useCommandPalette'
import { useProjects } from '../composables/useProjects'
import { useTheme } from '../composables/useTheme'
import { useAnalytics } from '../composables/useAnalytics'

interface Command {
  id: string
  group: 'navigation' | 'projects' | 'actions'
  label: string
  hint?: string
  icon: Component
  run: () => void
}

const { t, tm, locale } = useI18n()
const router = useRouter()
const { isOpen, close, toggle } = useCommandPalette()
const { projects } = useProjects()
const { isDark, toggleDark } = useTheme()
const { trackClick } = useAnalytics()

const query = ref('')
const activeIndex = ref(0)
const input = ref<HTMLInputElement | null>(null)
const feedback = ref('')
let previousFocus: HTMLElement | null = null

const isLocked = useScrollLock(typeof document !== 'undefined' ? document.body : null)

const sections = ['about', 'projects', 'skills', 'education', 'experience', 'contact']

const contact = computed(() => tm('contact') as { email: string; githubUrl: string; linkedinUrl: string })

const commands = computed((): Command[] => [
  ...sections.map((id) => ({
    id: `section-${id}`,
    group: 'navigation' as const,
    label: t(`navbar.${id}`),
    icon: HashtagIcon,
    run: () => router.push(`/#${id}`),
  })),
  {
    id: 'page-about',
    group: 'navigation',
    label: t('aboutPage.title'),
    hint: '/sobre',
    icon: UserIcon,
    run: () => router.push('/sobre'),
  },
  ...projects.value.map((project) => ({
    id: `project-${project.slug}`,
    group: 'projects' as const,
    label: project.title,
    hint: project.tags.slice(0, 3).join(' · '),
    icon: FolderIcon,
    run: () => router.push(`/projetos/${project.slug}`),
  })),
  {
    id: 'copy-email',
    group: 'actions',
    label: t('palette.actions.copyEmail'),
    hint: contact.value.email,
    icon: EnvelopeIcon,
    run: async () => {
      await navigator.clipboard?.writeText(contact.value.email)
      feedback.value = t('palette.copied')
    },
  },
  {
    id: 'toggle-theme',
    group: 'actions',
    label: t('palette.actions.toggleTheme'),
    icon: isDark.value ? SunIcon : MoonIcon,
    run: () => toggleDark(),
  },
  {
    id: 'toggle-language',
    group: 'actions',
    label: t('palette.actions.toggleLanguage'),
    hint: locale.value === 'pt' ? 'English' : 'Português',
    icon: LanguageIcon,
    run: () => (locale.value = locale.value === 'pt' ? 'en' : 'pt'),
  },
  {
    id: 'open-github',
    group: 'actions',
    label: t('palette.actions.openGithub'),
    icon: ArrowTopRightOnSquareIcon,
    run: () => window.open(contact.value.githubUrl, '_blank', 'noopener'),
  },
  {
    id: 'open-linkedin',
    group: 'actions',
    label: t('palette.actions.openLinkedin'),
    icon: ArrowTopRightOnSquareIcon,
    run: () => window.open(contact.value.linkedinUrl, '_blank', 'noopener'),
  },
])

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

const results = computed(() => {
  const q = normalize(query.value.trim())
  if (!q) return commands.value
  return commands.value.filter((c) => normalize(`${c.label} ${c.hint ?? ''}`).includes(q))
})

const groups = computed(() =>
  (['navigation', 'projects', 'actions'] as const)
    .map((group) => ({ group, items: results.value.filter((c) => c.group === group) }))
    .filter((g) => g.items.length)
)

// Flat index across groups, so arrow keys move through the list as rendered.
const indexOf = (command: Command) => results.value.indexOf(command)

watch(query, () => {
  activeIndex.value = 0
  feedback.value = ''
})

watch(isOpen, async (value) => {
  isLocked.value = value
  if (value) {
    previousFocus = document.activeElement as HTMLElement | null
    query.value = ''
    feedback.value = ''
    activeIndex.value = 0
    await nextTick()
    input.value?.focus()
  } else {
    previousFocus?.focus?.()
  }
})

const runCommand = (command: Command | undefined) => {
  if (!command) return
  trackClick('run_command', { command: command.id })
  command.run()
  // Keep the palette open after copying so the confirmation is visible.
  if (command.id !== 'copy-email') close()
}

const scrollActiveIntoView = () =>
  nextTick(() => document.getElementById(`cmd-${activeIndex.value}`)?.scrollIntoView({ block: 'nearest' }))

const onInputKeydown = (e: KeyboardEvent) => {
  const total = results.value.length
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = total ? (activeIndex.value + 1) % total : 0
    scrollActiveIntoView()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = total ? (activeIndex.value - 1 + total) % total : 0
    scrollActiveIntoView()
  } else if (e.key === 'Enter') {
    e.preventDefault()
    runCommand(results.value[activeIndex.value])
  }
}

onKeyStroke('k', (e) => {
  if (!(e.metaKey || e.ctrlKey)) return
  e.preventDefault()
  if (!isOpen.value) trackClick('open_command_palette', { source: 'shortcut' })
  toggle()
})

onKeyStroke('Escape', () => {
  if (isOpen.value) close()
})

</script>

<template>
  <Teleport to="body">
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh] bg-neutral-900/20 dark:bg-black/50 backdrop-blur-sm"
        @click.self="close"
      >
        <div
          role="dialog"
          aria-modal="true"
          :aria-label="t('navbar.search')"
          class="palette w-full max-w-xl overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-white/80 to-white/60 dark:from-neutral-800/80 dark:to-neutral-900/70 backdrop-blur-3xl border border-white/60 dark:border-neutral-700/50 shadow-2xl shadow-black/20 dark:shadow-black/50"
        >
          <div class="flex items-center gap-3 px-5 border-b border-black/5 dark:border-white/10">
            <MagnifyingGlassIcon class="w-5 h-5 shrink-0 text-neutral-500 dark:text-gray-400" />
            <input
              ref="input"
              v-model="query"
              type="text"
              role="combobox"
              aria-expanded="true"
              aria-controls="command-list"
              :aria-activedescendant="results.length ? `cmd-${activeIndex}` : undefined"
              :placeholder="t('palette.placeholder')"
              class="w-full py-4 bg-transparent text-base text-neutral-900 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-gray-500 outline-none"
              @keydown="onInputKeydown"
            />
            <kbd class="hidden sm:inline text-[11px] font-semibold px-1.5 py-0.5 rounded-md border border-black/10 dark:border-white/15 text-neutral-500 dark:text-gray-400">esc</kbd>
          </div>

          <ul id="command-list" role="listbox" class="max-h-[55vh] overflow-y-auto p-2">
            <template v-for="group in groups" :key="group.group">
              <li role="presentation" class="px-3 pt-3 pb-1.5 text-xs font-semibold text-neutral-500 dark:text-gray-500">
                {{ t(`palette.groups.${group.group}`) }}
              </li>
              <li
                v-for="command in group.items"
                :id="`cmd-${indexOf(command)}`"
                :key="command.id"
                role="option"
                :aria-selected="indexOf(command) === activeIndex"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors duration-150"
                :class="indexOf(command) === activeIndex
                  ? 'bg-white/80 dark:bg-white/10 text-neutral-900 dark:text-white shadow-sm shadow-black/5'
                  : 'text-neutral-700 dark:text-gray-300'"
                @mousemove="activeIndex = indexOf(command)"
                @click="runCommand(command)"
              >
                <component :is="command.icon" class="w-5 h-5 shrink-0 text-neutral-500 dark:text-gray-400" />
                <span class="font-medium truncate">{{ command.label }}</span>
                <span v-if="command.hint" class="ml-auto text-xs text-neutral-500 dark:text-gray-500 truncate">{{ command.hint }}</span>
              </li>
            </template>

            <li v-if="!results.length" class="px-3 py-8 text-center text-sm text-neutral-500 dark:text-gray-400">
              {{ t('palette.empty') }}
            </li>
          </ul>

          <div class="flex items-center justify-between gap-3 px-5 py-3 border-t border-black/5 dark:border-white/10 text-xs text-neutral-500 dark:text-gray-500">
            <span aria-live="polite" class="text-emerald-600 dark:text-emerald-400 font-medium">{{ feedback }}</span>
            <span class="hidden sm:flex items-center gap-1.5">
              <kbd class="px-1.5 py-0.5 rounded-md border border-black/10 dark:border-white/15">↑</kbd>
              <kbd class="px-1.5 py-0.5 rounded-md border border-black/10 dark:border-white/15">↓</kbd>
              {{ t('palette.hint') }}
              <kbd class="ml-2 px-1.5 py-0.5 rounded-md border border-black/10 dark:border-white/15">↵</kbd>
              {{ t('palette.select') }}
            </span>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.palette {
  animation: palette-in 0.22s cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes palette-in {
  from {
    transform: translateY(-8px) scale(0.98);
  }
}
</style>
