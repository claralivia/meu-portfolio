import { ref } from 'vue'

// Index of the project currently pinned in the showcase. ProjectsSection writes
// it from the scroll position; StageFrame reads it to pick the screenshot.
const activeIndex = ref(0)

export function useShowcase() {
  return { activeIndex }
}
