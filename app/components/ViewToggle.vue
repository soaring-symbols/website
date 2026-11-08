<template>
  <!-- Pick one of a few views; the one shown wears the signal yellow -->
  <UFieldGroup :aria-label="label">
    <UButton
      v-for="option in options"
      :key="option.value"
      :label="option.label"
      :icon="option.icon"
      :aria-label="option.label ? undefined : option.ariaLabel"
      :aria-pressed="model === option.value"
      :color="model === option.value ? 'primary' : 'neutral'"
      :variant="model === option.value ? 'subtle' : 'outline'"
      :ui="option.label ? { label: 'block' } : undefined"
      @click="model = option.value"
    />
  </UFieldGroup>
</template>

<script setup lang="ts">
interface ViewOption {
  value: string
  icon: string
  // Shown beside the icon; icon-only buttons name themselves with ariaLabel
  label?: string
  ariaLabel?: string
}

defineProps<{ options: ViewOption[]; label?: string }>()

const model = defineModel<string>({ required: true })
</script>
