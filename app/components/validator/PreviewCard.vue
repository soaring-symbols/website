<template>
  <UCard :ui="{ body: 'p-0' }">
    <!-- File header -->
    <template #header>
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 min-w-0">
          <UIcon name="hugeicons:file-01" class="size-4 text-muted shrink-0" />
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
      <!-- Zoom controls -->
      <div
        class="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-10"
      >
        <UButton
          icon="hugeicons:full-screen"
          size="xs"
          variant="subtle"
          title="Fit"
          @click="zoomLevel = 1"
        />
        <UButton
          icon="hugeicons:add-01"
          size="xs"
          variant="subtle"
          title="Zoom in"
          @click="zoomIn"
        />
        <UButton
          icon="hugeicons:minus-sign"
          size="xs"
          variant="subtle"
          title="Zoom out"
          @click="zoomOut"
        />
        <UButton
          label="1:1"
          size="xs"
          variant="subtle"
          class="font-mono text-xs justify-center"
          title="Reset zoom"
          @click="zoomLevel = 1"
        />
      </div>

      <!-- SVG image -->
      <img
        :src="previewUrl"
        :alt="fileName"
        class="object-contain transition-transform duration-200"
        :style="imageStyle"
      />

      <!-- Dimensions pill -->
      <div
        class="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs px-3 py-1.5 rounded-full flex items-center gap-2 whitespace-nowrap backdrop-blur-sm font-mono border border-default bg-default/80"
      >
        <span>{{ metadata?.dimensions ?? '—' }}</span>
        <span class="opacity-40">·</span>
        <span>viewBox: {{ metadata?.viewBox ?? '—' }}</span>
      </div>
    </div>

    <!-- Metadata stats footer -->
    <template #footer>
      <ValidatorMetadataStats v-bind="metadata" />
    </template>
  </UCard>
</template>

<script setup>
const props = defineProps({
  previewUrl: String,
  fileName: String,
  metadata: Object,
  allPass: Boolean,
})

defineEmits(['remove'])

const colorMode = useColorMode()

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

const imageStyle = computed(() => ({
  width: '192px',
  height: '192px',
  transform: `scale(${zoomLevel.value})`,
  transformOrigin: 'center center',
}))

function zoomIn() {
  zoomLevel.value = Math.min(4, parseFloat((zoomLevel.value + 0.25).toFixed(2)))
}

function zoomOut() {
  zoomLevel.value = Math.max(
    0.25,
    parseFloat((zoomLevel.value - 0.25).toFixed(2)),
  )
}
</script>
