<template>
  <div class="pt-8 pb-16 sm:pt-12">
    <UPageHeader
      :title="meta.title"
      :description="meta.description"
      :links="[
        {
          label: 'Contribution guidelines',
          icon: 'hugeicons:github',
          to: 'https://github.com/soaring-symbols/soaring-symbols/blob/main/CONTRIBUTING.md',
          target: '_blank',
          ui: { label: 'block' },
        },
      ]"
      :ui="{ title: 'text-4xl sm:text-5xl', description: 'text-lg' }"
      class="mb-8"
    />

    <SvgValidator />
  </div>
</template>

<script setup>
const meta = {
  title: 'Check an SVG',
  description:
    'Upload a logo or icon to check it against the contribution guidelines before you open a pull request. Add the original artwork to compare the two side by side.',
}

useSeoMeta({
  title: meta.title,
  description: meta.description,
  ogTitle: meta.title,
  ogDescription: meta.description,
})

defineOgImage('Site', { title: meta.title, description: meta.description })
</script>
