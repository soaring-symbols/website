<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-center gap-2">
      <UBadge :label="label" :color="color" />
    </div>

    <ValidatorPreviewCard
      v-if="svg.file.value"
      :preview-url="svg.previewUrl.value"
      :file-name="svg.file.value.name"
      :metadata="svg.metadata.value"
      @remove="svg.file.value = null"
    />
    <UFileUpload
      v-else
      v-model="svg.file.value"
      accept=".svg,image/svg+xml"
      icon="hugeicons:upload-04"
      :label="`Drop the ${label.toLowerCase()} SVG here`"
      description="or click to browse"
      class="min-h-80"
    />
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  color: { type: String, default: 'neutral' },
  svg: { type: Object, required: true },
})
</script>
