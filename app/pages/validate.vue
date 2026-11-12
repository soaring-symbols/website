<template>
  <div class="pt-8 pb-16 sm:pt-12">
    <UPageHeader
      :title="meta.title"
      :description="meta.description"
      :links="[
        {
          label: 'Contribution guidelines',
          icon: 'simple-icons:github',
          to: CONTRIBUTING_URL,
          target: '_blank',
          ui: { label: 'block' },
        },
      ]"
      class="mb-8"
    />

    <SvgValidator />
  </div>
</template>

<script setup>
const meta = {
  title: 'Check and fix an SVG',
  description:
    'Check a logo or icon against the contribution guidelines, fix what the linter can and download the result, or compare it with the original artwork before you open a pull request.',
}

useSeoMeta({
  title: meta.title,
  description: meta.description,
  ogTitle: meta.title,
  ogDescription: meta.description,
})

defineOgImage('Site', { title: meta.title, description: meta.description })
</script>
