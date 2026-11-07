<template>
  <div class="pt-8 pb-16 sm:pt-12">
    <UPageHeader
      :title="meta.title"
      :description="meta.description"
      :links="[
        {
          label: 'npm package',
          icon: 'simple-icons:npm',
          to: 'https://www.npmjs.com/package/soaring-symbols',
          target: '_blank',
          ui: { label: 'block' },
        },
      ]"
    />

    <UPageSection
      v-for="group in groups"
      :id="group.id"
      :key="group.id"
      :title="group.title"
      :description="group.description"
      :ui="{
        container: 'px-0 sm:px-0 lg:px-0 py-12 sm:py-16 lg:py-16',
        features: 'lg:grid-cols-2',
      }"
    >
      <template #features>
        <EcosystemCard
          v-for="entry in group.entries"
          :key="entry.id"
          :entry="entry"
        />
      </template>
    </UPageSection>
  </div>
</template>

<script setup lang="ts">
import { ecosystem, ecosystemGroups } from '~/data/ecosystem'

const meta = {
  title: 'Ecosystem',
  description:
    'Beyond the npm package, the same marks and airline data come as files on a CDN, a JSON and image API, and apps and plugins for the tools you already use.',
}

useSeoMeta({
  title: meta.title,
  description: meta.description,
  ogTitle: meta.title,
  ogDescription: meta.description,
})

defineOgImage('Site', { title: meta.title, description: meta.description })

const groups = ecosystemGroups.map((group) => ({
  ...group,
  entries: ecosystem.filter((entry) => entry.group === group.id),
}))
</script>
