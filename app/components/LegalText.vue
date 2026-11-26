<template>
  <!-- Running text for the privacy policy and the terms: headings, paragraphs,
       lists, code and links styled from here, so each page writes plain HTML -->
  <div
    class="mt-10 max-w-3xl text-default [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_code]:rounded [&_code]:bg-elevated [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-sm [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-highlighted [&_p]:mt-3 [&_p]:text-pretty [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6"
  >
    <p class="text-sm text-muted">Last updated {{ updated }}</p>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  // The date the text last changed, e.g. "November 26, 2026"
  updated: { type: String, required: true },
})
</script>
