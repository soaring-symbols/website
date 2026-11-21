<template>
  <!-- A square that zooms into its content (useZoomPan) -->
  <div
    ref="viewport"
    class="relative aspect-square border border-default rounded-md overflow-clip touch-none select-none"
    :class="cursor"
    title="Ctrl/⌘ + scroll or double-click to zoom, drag to move"
    v-on="handlers"
  >
    <div
      ref="content"
      class="absolute inset-0"
      :class="{ 'zoom-pixelated': zoom >= PIXELATED_FROM }"
      :style="{ transform }"
    >
      <slot />
    </div>

    <ZoomControls
      class="absolute right-2 top-2 z-10"
      :zoom="zoom"
      :min="1"
      :max="MAX_ZOOM"
      @zoom="zoomBy"
      @reset="reset"
    />
  </div>
</template>

<script setup>
const MAX_ZOOM = 16
// From here on each source pixel is several screen pixels: show them as
// squares rather than blur them, so a one-pixel difference stays visible
const PIXELATED_FROM = 2

const viewport = ref(null)
const content = ref(null)
const { zoom, transform, cursor, zoomBy, reset, handlers } = useZoomPan(
  viewport,
  content,
  { max: MAX_ZOOM },
)

defineExpose({ reset })
</script>

<style scoped>
.zoom-pixelated :deep(canvas) {
  image-rendering: pixelated;
}
</style>
