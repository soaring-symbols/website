<template>
  <UPageFeature
    :id="entry.id"
    as="li"
    :icon="entry.icon"
    :title="entry.name"
    orientation="horizontal"
    class="scroll-mt-24"
  >
    <template #title>
      <span class="inline-flex flex-wrap items-center gap-2">
        {{ entry.name }}
        <UBadge
          v-if="entry.status"
          :label="entry.status"
          color="neutral"
          variant="subtle"
          size="sm"
        />
      </span>
    </template>
    <template #description>
      <p>{{ entry.description }}</p>
      <code
        v-if="entry.snippet"
        class="mt-3 block w-fit max-w-full overflow-x-auto rounded-md border border-accented bg-elevated px-3 py-2 font-mono text-xs whitespace-nowrap text-highlighted"
        >{{ entry.snippet.code }}</code
      >
      <UButton
        v-if="entry.link"
        :to="entry.link.to"
        target="_blank"
        :label="entry.link.label"
        trailing-icon="solar:arrow-right-up-linear"
        variant="outline"
        class="mt-4"
        :ui="{ label: 'block' }"
      />
      <UButton
        v-else-if="entry.snippet"
        :label="entry.snippet.label"
        icon="solar:copy-linear"
        variant="outline"
        class="mt-4"
        :ui="{ label: 'block' }"
        @click="copySnippet(entry.snippet)"
      />
    </template>
  </UPageFeature>
</template>

<script setup lang="ts">
import type { EcosystemEntry } from '~/data/ecosystem'

defineProps<{ entry: EcosystemEntry }>()

const toast = useToast()

async function copySnippet(snippet: { code: string }) {
  await navigator.clipboard.writeText(snippet.code)
  toast.add({ title: 'Copied', duration: 1500 })
}
</script>
