<script setup lang="ts">
// Outline icons Heroicons doesn't ship, drawn on the same 24px grid and stroke
// weight so they sit next to Heroicons without looking out of place.
defineProps<{ name: 'games' | 'coffee' | 'pets' }>()
</script>

<template>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <template v-if="name === 'games'">
      <path d="M7 8h10a4 4 0 0 1 3.9 4.8l-.9 4.2a2.4 2.4 0 0 1-4.2 1L14.2 16H9.8L8.2 18a2.4 2.4 0 0 1-4.2-1l-.9-4.2A4 4 0 0 1 7 8Z" />
      <path d="M8 10.75v3M6.5 12.25h3" />
      <path d="M15.5 11.5h.01M17 13h.01" stroke-width="2.2" />
    </template>
    <template v-else-if="name === 'coffee'">
      <path d="M4.5 9.5h11v4.25A5.25 5.25 0 0 1 10.25 19h-.5A5.25 5.25 0 0 1 4.5 13.75V9.5Z" />
      <path d="M15.5 11h1.25a2.5 2.5 0 0 1 0 5H15" />
      <path d="M8 3.5c-.6.7-.6 1.5 0 2.25s.6 1.5 0 2.25M11.5 3.5c-.6.7-.6 1.5 0 2.25s.6 1.5 0 2.25" />
    </template>
    <template v-else>
      <path d="M12 12.25c-2.7 0-5.25 2.75-5.25 5 0 1.5 1.15 2.25 2.5 2.25 1.05 0 1.75-.6 2.75-.6s1.7.6 2.75.6c1.35 0 2.5-.75 2.5-2.25 0-2.25-2.55-5-5.25-5Z" />
      <path d="M5.25 11.75a1.75 1.75 0 1 0 3.5 0 1.75 1.75 0 1 0-3.5 0ZM15.25 11.75a1.75 1.75 0 1 0 3.5 0 1.75 1.75 0 1 0-3.5 0ZM8.25 7a1.75 1.75 0 1 0 3.5 0 1.75 1.75 0 1 0-3.5 0ZM12.25 7a1.75 1.75 0 1 0 3.5 0 1.75 1.75 0 1 0-3.5 0Z" />
    </template>
  </svg>
</template>
