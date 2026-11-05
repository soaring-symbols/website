<template>
  <!-- SVG flags, since Windows draws flag emoji as bare letters -->
  <span class="inline-flex shrink-0 gap-1 align-[-0.1em]" aria-hidden="true">
    <UIcon
      v-for="name in countryFlagIcons(iso)"
      :key="name"
      :name="name"
      class="h-[0.9em] w-[1.2em] rounded-[2px] ring-1 ring-black/10 ring-inset dark:ring-white/20"
    />
  </span>
</template>

<script setup>
defineProps({
  // One ISO 3166-1 alpha-2 code, or several joined by commas
  iso: { type: String, required: true },
})
</script>
