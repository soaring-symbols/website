<template>
  <UCard :ui="{ body: 'p-0' }">
    <!-- File header -->
    <template #header>
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 min-w-0">
          <UIcon
            name="solar:file-code-linear"
            class="size-4 text-muted shrink-0"
          />
          <span class="font-medium text-sm truncate">{{ fileName }}</span>
        </div>
        <UButton
          icon="solar:close-linear"
          variant="ghost"
          size="xs"
          @click="$emit('remove')"
        />
      </div>
    </template>

    <!-- Preview area with checkerboard; zooms and pans (useZoomPan) -->
    <div
      ref="viewport"
      class="relative flex items-center justify-center overflow-clip touch-none select-none"
      :class="cursor"
      style="min-height: 280px"
      :style="checkerboardStyle"
      title="Ctrl/⌘ + scroll or double-click to zoom, drag to move"
      v-on="handlers"
    >
      <!-- Zoom controls, in a corner so they never cover the artwork -->
      <ZoomControls
        class="absolute right-3 top-3 z-10"
        :zoom="zoom"
        :min="MIN_ZOOM"
        :max="MAX_ZOOM"
        @zoom="zoomBy"
        @reset="reset"
      />

      <!-- SVG in its viewBox: the dashed frame is the viewBox's edge -->
      <div ref="frame" class="relative size-48 shrink-0" :style="{ transform }">
        <div
          class="absolute inset-0 border border-dashed border-primary/60 pointer-events-none"
        />
        <!-- currentColor can't reach an <img>, so a mono SVG is drawn as a
             mask filled with the text color, readable in either theme -->
        <div
          v-if="mono"
          role="img"
          :aria-label="fileName"
          class="size-full bg-inverted"
          :style="maskStyle"
        />
        <img
          v-else
          :src="previewUrl"
          :alt="fileName"
          class="size-full object-contain"
        />
      </div>
    </div>

    <!-- Metadata stats footer -->
    <template v-if="stats" #footer>
      <ValidatorMetadataStats v-bind="metadata" />
    </template>
  </UCard>
</template>

<script setup>
const props = defineProps({
  previewUrl: { type: String, default: '' },
  fileName: { type: String, default: '' },
  metadata: { type: Object, default: () => ({}) },
  // Drawn only in currentColor (a -mono.svg)
  mono: Boolean,
  // Off where the same numbers are shown elsewhere, as in a comparison
  stats: { type: Boolean, default: true },
})

defineEmits(['remove'])

const colorMode = useColorMode()

const MIN_ZOOM = 0.25
const MAX_ZOOM = 16
const viewport = ref(null)
const frame = ref(null)
const { zoom, transform, cursor, zoomBy, reset, handlers } = useZoomPan(
  viewport,
  frame,
  { min: MIN_ZOOM, max: MAX_ZOOM },
)
// A new file starts at 100%
watch(() => props.previewUrl, reset)

const checkerboardStyle = computed(() => {
  const dark = colorMode.value === 'dark'
  const checker = dark ? '#374151' : '#e5e7eb'
  const bg = dark ? '#1f2937' : '#ffffff'
  return {
    backgroundImage: `linear-gradient(45deg, ${checker} 25%, transparent 25%), linear-gradient(135deg, ${checker} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${checker} 75%), linear-gradient(135deg, transparent 75%, ${checker} 75%)`,
    backgroundSize: '16px 16px',
    backgroundPosition: '0 0, 8px 0, 8px -8px, 0 8px',
    backgroundColor: bg,
  }
})

const maskStyle = computed(() => {
  const mask = {
    image: `url("${props.previewUrl}")`,
    size: 'contain',
    repeat: 'no-repeat',
    position: 'center',
  }
  return Object.fromEntries(
    Object.entries(mask).flatMap(([key, value]) => [
      [`mask-${key}`, value],
      [`-webkit-mask-${key}`, value],
    ]),
  )
})
</script>
