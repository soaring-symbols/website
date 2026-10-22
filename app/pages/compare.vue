<template>
  <UDashboardPanel>
    <template #body>
      <UPageHeader v-bind="meta" />

      <SvgCompare />
    </template>
  </UDashboardPanel>
</template>

<script setup>
const meta = {
  title: 'SVG Compare',
  description:
    'Compare two versions of an airline SVG, or an SVG against its PNG reference, to make sure optimizing, merging paths or vectorizing did not change how it looks.',
}

useSeoMeta({
  title: meta.title,
  description: meta.description,
  ogTitle: meta.title,
  ogDescription: meta.description,
})
</script>
