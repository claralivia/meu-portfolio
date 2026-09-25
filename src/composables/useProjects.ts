import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { techKey } from '../components/icons/techIcons'

export interface ProjectLink {
  label: string
  url: string
}

export interface Project {
  title: string
  slug: string
  key: string
  category: string
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

// Technology picked in the dock; ProjectsSection filters the carousel by it.
const selectedTech = ref<string | null>(null)

export function useProjects() {
  const { tm } = useI18n()

  const projects = computed((): Project[] => (tm('projects.items') as Project[]) || [])

  const findBySlug = (slug: string) => projects.value.find((p) => p.slug === slug)

  const usesTech = (project: Project, key: string) => project.tags.some((tag) => techKey(tag) === key)

  return { projects, findBySlug, usesTech, selectedTech }
}
