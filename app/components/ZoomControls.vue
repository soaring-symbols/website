<template>
  <!-- − 100% + for a zoomable view (useZoomPan); the percentage resets it.
       Pointer events stop here, so pressing a button never drags or
       double-click zooms the view under it. -->
  <div class="flex items-center gap-1" @pointerdown.stop @dblclick.stop>
    <UButton
      icon="solar:minus-linear"
      size="xs"
      variant="subtle"
      aria-label="Zoom out"
      title="Zoom out"
      :disabled="zoom <= min"
      @click="$emit('zoom', 1 / step)"
    />
    <UButton
      :label="`${Math.round(zoom * 100)}%`"
      size="xs"
      variant="subtle"
      class="font-mono justify-center min-w-14"
      :ui="{ label: 'block' }"
      title="Reset zoom"
      @click="$emit('reset')"
    />
    <UButton
      icon="solar:add-linear"
      size="xs"
      variant="subtle"
      aria-label="Zoom in"
      title="Zoom in"
      :disabled="zoom >= max"
      @click="$emit('zoom', step)"
    />
  </div>
</template>

<script setup>
defineProps({
  zoom: { type: Number, required: true },
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  step: { type: Number, default: 2 },
})

defineEmits(['zoom', 'reset'])
</script>
