<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-center gap-2">
      <UBadge :label="label" :color="color" />
    </div>

    <ValidatorPreviewCard
      v-if="image.file.value"
      :preview-url="image.previewUrl.value"
      :file-name="image.file.value.name"
      :metadata="image.metadata.value"
      @remove="image.file.value = null"
    />
    <UFileUpload
      v-else
      v-model="image.file.value"
      accept=".svg,image/svg+xml,image/png,image/jpeg,image/webp"
      icon="hugeicons:upload-04"
      :label="`Drop the ${label.toLowerCase()} file here`"
      description="SVG, or a PNG, JPEG or WebP reference"
      class="min-h-80"
    />
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  color: { type: String, default: 'neutral' },
  image: { type: Object, required: true },
})
</script>
