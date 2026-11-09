import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export interface ProjectLink {
  label: string
  url: string
}

export interface Project {
  title: string
  slug: string
  key: string
  category: string
  /** One short line for the card; `description` is the longer text for the case study. */
  tagline?: string
  description: string
  challenge?: string
  solution?: string
  decisions?: string[]
  highlights?: string[]
  tags: string[]
  githubUrl?: string
  githubUrls?: ProjectLink[]
  liveUrl?: string
}

export function useProjects() {
  const { tm } = useI18n()

  const projects = computed((): Project[] => (tm('projects.items') as Project[]) || [])

  const findBySlug = (slug: string) => projects.value.find((p) => p.slug === slug)

  return { projects, findBySlug }
}
