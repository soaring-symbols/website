<template>
  <UCard :ui="{ body: 'p-0' }">
    <!-- File header -->
    <template #header>
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 min-w-0">
          <UIcon name="hugeicons:svg-01" class="size-4 text-muted shrink-0" />
          <span class="font-medium text-sm truncate">{{ fileName }}</span>
        </div>
        <UButton
          icon="hugeicons:cancel-01"
          variant="ghost"
          size="xs"
          @click="$emit('remove')"
        />
      </div>
    </template>

    <!-- Preview area with checkerboard -->
    <div
      class="relative flex items-center justify-center overflow-hidden"
      style="min-height: 280px"
      :style="checkerboardStyle"
    >
      <!-- Zoom controls, in a corner so they never cover the artwork -->
      <div class="absolute right-3 top-3 flex items-center gap-1 z-10">
        <UButton
          icon="hugeicons:minus-sign"
          size="xs"
          variant="subtle"
          aria-label="Zoom out"
          title="Zoom out"
          :disabled="zoomLevel <= MIN_ZOOM"
          @click="zoomOut"
        />
        <UButton
          :label="`${Math.round(zoomLevel * 100)}%`"
          size="xs"
          variant="subtle"
          class="font-mono justify-center min-w-14"
          :ui="{ label: 'block' }"
          title="Reset zoom"
          @click="zoomLevel = 1"
        />
        <UButton
          icon="hugeicons:add-01"
          size="xs"
          variant="subtle"
          aria-label="Zoom in"
          title="Zoom in"
          :disabled="zoomLevel >= MAX_ZOOM"
          @click="zoomIn"
        />
      </div>

      <!-- SVG in its viewBox: the dashed frame is the viewBox's edge -->
      <div
        class="relative transition-transform duration-200"
        :style="frameStyle"
      >
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
const MAX_ZOOM = 4
const zoomLevel = ref(1)

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

const frameStyle = computed(() => ({
  width: '192px',
  height: '192px',
  transform: `scale(${zoomLevel.value})`,
  transformOrigin: 'center center',
}))

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

function zoomIn() {
  zoomLevel.value = Math.min(MAX_ZOOM, zoomLevel.value + 0.25)
}

function zoomOut() {
  zoomLevel.value = Math.max(MIN_ZOOM, zoomLevel.value - 0.25)
}
</script>
