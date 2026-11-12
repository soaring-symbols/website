<template>
  <!-- Fills its grid cell, so an empty side matches a loaded one's height -->
  <div class="flex flex-col gap-2 h-full">
    <div class="flex items-center justify-between gap-2 min-h-6">
      <UBadge :label="label" :color="color" variant="subtle" />
      <slot />
    </div>

    <!-- The comparison lists both files' numbers, so the cards leave them out -->
    <ValidatorPreviewCard
      v-if="image.file.value"
      :preview-url="image.previewUrl.value"
      :file-name="image.file.value.name"
      :metadata="image.metadata.value"
      :mono="image.isMono.value"
      :stats="false"
      @remove="image.file.value = null"
    />
    <UFileUpload
      v-else
      v-model="image.file.value"
      :accept="accept"
      icon="solar:upload-linear"
      :label="dropLabel"
      :description="description"
      class="min-h-80 flex-1"
      :ui="{ base: 'flex-1' }"
    />
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  color: { type: String, default: 'neutral' },
  image: { type: Object, required: true },
  accept: { type: String, required: true },
  description: { type: String, default: '' },
  // The empty dropzone's prompt, e.g. "Drop the original here"
  dropLabel: { type: String, required: true },
})
</script>
