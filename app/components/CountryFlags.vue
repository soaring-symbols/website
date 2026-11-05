<template>
  <!-- SVG flags, since Windows draws flag emoji as bare letters -->
  <span class="inline-flex shrink-0 gap-1" aria-hidden="true">
    <img
      v-for="src in countryFlagUrls(iso)"
      :key="src"
      :src="src"
      alt=""
      width="16"
      height="12"
      loading="lazy"
      decoding="async"
      class="h-[0.9em] w-[1.2em] rounded-[2px] object-cover ring-1 ring-black/10 dark:ring-white/20"
    />
  </span>
</template>

<script setup>
defineProps({
  // One ISO 3166-1 alpha-2 code, or several joined by commas
  iso: { type: String, required: true },
})
</script>
