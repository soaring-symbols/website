<script setup lang="ts">
// Social card for the site's own pages: a title on the departure-board
// dark, with the wayfinding yellow as the one accent
const {
  title = 'Airline logos and icons, drawn as clean SVG.',
  description = 'A curated collection of airline branding assets.',
} = defineProps<{
  title?: string
  description?: string
}>()
</script>

<template>
  <div
    class="flex h-full w-full font-sans flex-col justify-between p-20"
    :style="{ backgroundColor: '#1f242b', color: '#ecebe4' }"
  >
    <div class="flex flex-row items-center">
      <div
        class="h-6 w-6 rounded-full"
        :style="{ backgroundColor: '#ffc20e' }"
      />
      <span class="ml-4 text-3xl font-bold">Soaring Symbols</span>
    </div>

    <div class="flex flex-col">
      <span class="text-7xl leading-tight font-extrabold">{{ title }}</span>
      <span class="mt-8 text-4xl" :style="{ color: '#ecebe4b3' }">
        {{ description }}
      </span>
    </div>

    <div class="flex flex-row">
      <div
        class="h-3 w-40 rounded-full"
        :style="{ backgroundColor: '#ffc20e' }"
      />
    </div>
  </div>
</template>
