<template>
  <UCard>
    <div class="flex flex-wrap items-center gap-3">
      <URadioGroup
        :model-value="type"
        :items="typeOptions"
        orientation="horizontal"
        @update:model-value="$emit('update:type', $event)"
      />
      <UBadge
        v-if="detectedFrom"
        :label="`Detected from the ${detectedFrom}`"
        icon="hugeicons:magic-wand-01"
        size="sm"
      />

      <!-- The name <title> should hold: a catalog airline, or a new one -->
      <USelectMenu
        v-if="hasFile"
        :model-value="airline ?? undefined"
        :items="airlineNames"
        placeholder="Airline (for the title)"
        icon="hugeicons:airplane-01"
        create-item
        class="w-full sm:w-64"
        @update:model-value="$emit('update:airline', $event)"
        @create="onCreate"
      />

      <div class="flex items-center gap-2 ms-auto">
        <UButton
          :label="hasFile ? 'Replace SVG' : 'Upload SVG'"
          icon="hugeicons:upload-04"
          :color="hasFile ? 'neutral' : 'primary'"
          :variant="hasFile ? 'outline' : 'solid'"
          @click="$emit('upload')"
        />
      </div>
    </div>
  </UCard>
</template>

<script setup>
defineProps({
  type: String,
  // Where the type was detected from, cleared once the user picks one
  detectedFrom: { type: String, default: null },
  // An SVG is loaded, so the button replaces it
  hasFile: Boolean,
  airline: { type: String, default: null },
})

const emit = defineEmits(['update:type', 'update:airline', 'upload'])

// Catalog names, after any typed for an airline it doesn't have yet (the
// menu only shows a value that is one of its items)
const { airlines } = useAirlines()
const created = ref([])
const airlineNames = computed(() => [
  ...created.value,
  ...airlines.map((a) => a.name),
])

function onCreate(name) {
  if (!created.value.includes(name)) created.value.unshift(name)
  emit('update:airline', name)
}

const typeOptions = [
  {
    label: 'Logo',
    value: 'logo',
    description: '64×64 viewBox, may contain text',
  },
  { label: 'Icon', value: 'icon', description: '24×24 viewBox, geometry only' },
]
</script>
