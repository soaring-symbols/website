<template>
  <UDashboardPanel>
    <template #body>
      <UPageHeader
        v-bind="meta"
        :links="[
          {
            label: 'Contribution Guidelines',
            icon: 'hugeicons:github',
            to: 'https://github.com/soaring-symbols/soaring-symbols/blob/main/CONTRIBUTING.md',
            target: '_blank',
            external: tree,
          },
        ]"
      />

      <SvgValidator />
    </template>
  </UDashboardPanel>
</template>

<script setup>
import { tree } from '#build/ui'

const meta = {
  title: 'SVG Validator',
  description:
    'Validate your airline SVG assets against the Soaring Symbols contribution guidelines.',
}

useSeoMeta({
  title: meta.title,
  description: meta.description,
  ogTitle: meta.title,
  ogDescription: meta.description,
})
</script>
