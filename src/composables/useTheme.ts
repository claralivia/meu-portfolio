import { useDark, useToggle } from '@vueuse/core'

// Single shared instance so the navbar and the command palette stay in sync.
const isDark = useDark()
const toggleDark = useToggle(isDark)

export function useTheme() {
  return { isDark, toggleDark }
}
