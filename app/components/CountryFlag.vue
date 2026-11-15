<template>
  <!-- An SVG flag, since Windows draws flag emoji as bare letters -->
  <img
    :src="countryFlagUrl(iso)"
    alt=""
    aria-hidden="true"
    width="16"
    height="12"
    loading="lazy"
    decoding="async"
    class="h-[0.9em] w-[1.2em] shrink-0 rounded-[2px] object-cover ring-1 ring-black/10 dark:ring-white/20"
  />
</template>

<script setup>
defineProps({
  // An ISO 3166-1 alpha-2 code, or a subdivision such as "GB-SCT"
  iso: { type: String, required: true },
})
</script>
