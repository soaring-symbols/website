<template>
  <div class="pt-8 pb-16 sm:pt-12">
    <UPageHeader
      :title="meta.title"
      :description="meta.description"
      :links="[
        {
          label: 'Contribution guidelines',
          icon: 'hugeicons:github',
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
  title: 'Check an SVG',
  description:
    'Check a logo or icon against the contribution guidelines before you open a pull request, or compare it with the original artwork to make sure it still looks the same.',
}

useSeoMeta({
  title: meta.title,
  description: meta.description,
  ogTitle: meta.title,
  ogDescription: meta.description,
})

defineOgImage('Site', { title: meta.title, description: meta.description })
</script>
