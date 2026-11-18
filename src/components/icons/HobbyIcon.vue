<script setup lang="ts">
// Small hand-built icons for the things Clara likes. One stroke weight, round caps.
defineProps<{ name: string }>()
</script>

<template>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
    <template v-if="name === 'coffee'">
      <path d="M5 9.5h11v4.5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9.5z" />
      <path d="M16 10.5h1.4a2.4 2.4 0 0 1 0 4.8H16" />
      <path d="M8.5 4.2c0 1.2 1 1.2 1 2.4M12.5 4.2c0 1.2 1 1.2 1 2.4" />
    </template>
    <template v-else-if="name === 'beach'">
      <circle cx="12" cy="8.5" r="3.2" />
      <path d="M12 2.4v.9M5.8 5l.7.6M18.2 5l-.7.6M4.2 9.6h.9M18.9 9.6h.9" />
      <path d="M3 15.5c2 0 2-1.4 4.5-1.4S10 15.5 12 15.5s2-1.4 4.5-1.4 2.5 1.4 4.5 1.4" />
      <path d="M3 19.8c2 0 2-1.4 4.5-1.4s2.5 1.4 4.5 1.4 2-1.4 4.5-1.4 2.5 1.4 4.5 1.4" />
    </template>
    <template v-else-if="name === 'games'">
      <path d="M7 8h10a4 4 0 0 1 3.9 4.9l-.9 3.7a2 2 0 0 1-3.4 1L14.8 15.5H9.2l-1.8 2.1a2 2 0 0 1-3.4-1l-.9-3.7A4 4 0 0 1 7 8z" />
      <path d="M8.2 10.8v3M6.7 12.3h3" />
      <circle cx="15.4" cy="11.6" r=".5" fill="currentColor" />
      <circle cx="17.4" cy="13.4" r=".5" fill="currentColor" />
    </template>
    <template v-else-if="name === 'pets'">
      <circle cx="6.8" cy="10" r="1.6" />
      <circle cx="10.6" cy="6.6" r="1.7" />
      <circle cx="15" cy="6.6" r="1.7" />
      <circle cx="18.6" cy="10" r="1.6" />
      <path d="M12.7 12c-3 0-5 2.8-5 4.6 0 1.9 1.5 2.4 3 2.4.8 0 1.3-.3 2-.3s1.2.3 2 .3c1.5 0 3-.5 3-2.4 0-1.8-2-4.6-5-4.6z" />
    </template>
    <template v-else-if="name === 'coconut'">
      <circle cx="11" cy="14" r="6.8" />
      <circle cx="9" cy="11.8" r=".5" fill="currentColor" />
      <circle cx="12.2" cy="11" r=".5" fill="currentColor" />
      <circle cx="10.8" cy="13.6" r=".5" fill="currentColor" />
      <path d="M14.5 8.2 18.5 3M16.5 3h3" />
    </template>
    <template v-else-if="name === 'family'">
      <path d="M4 11.2 12 4l8 7.2V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-7.8z" />
      <path d="M12 17.2c-2-1.4-3-2.4-3-3.6a1.6 1.6 0 0 1 3-.7 1.6 1.6 0 0 1 3 .7c0 1.2-1 2.2-3 3.6z" />
    </template>
    <template v-else>
      <!-- study (default): an open book -->
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5v-15z" />
      <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5v-15z" />
    </template>
  </svg>
</template>
