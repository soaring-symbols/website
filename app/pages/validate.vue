<template>
  <div class="pt-8 pb-16 sm:pt-12">
    <div
      class="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
    >
      <div class="max-w-2xl">
        <h1
          class="text-4xl font-extrabold tracking-tight text-highlighted sm:text-5xl"
        >
          {{ meta.title }}
        </h1>
        <p class="mt-3 text-lg text-toned text-pretty">
          {{ meta.description }}
        </p>
      </div>
      <UButton
        label="Contribution guidelines"
        icon="hugeicons:github"
        to="https://github.com/soaring-symbols/soaring-symbols/blob/main/CONTRIBUTING.md"
        target="_blank"
        variant="outline"
        class="shrink-0 self-start md:self-auto"
        :ui="{ label: 'block' }"
      />
    </div>

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
