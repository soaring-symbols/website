<template>
  <UCard>
    <!-- Two labeled settings for the checks and the fix, then the upload,
         each group set apart by a rule: across on phones, upright beside -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-stretch">
      <UFormField
        label="Type"
        :hint="detectedFrom ? `Detected from the ${detectedFrom}` : undefined"
        :ui="{ hint: 'text-xs' }"
        class="shrink-0"
      >
        <URadioGroup
          :model-value="type"
          :items="typeOptions"
          orientation="horizontal"
          @update:model-value="$emit('update:type', $event)"
        />
      </UFormField>

      <template v-if="hasFile">
        <div aria-hidden="true" :class="divider" />

        <!-- The name <title> should hold: a catalog airline, or a new one -->
        <UFormField
          label="Airline"
          hint="Sets the <title>"
          :ui="{ hint: 'text-xs' }"
          class="sm:w-72"
        >
          <USelectMenu
            :model-value="airline ?? undefined"
            :items="airlineNames"
            placeholder="Pick or type a name"
            icon="hugeicons:airplane-01"
            create-item
            class="w-full"
            @update:model-value="$emit('update:airline', $event)"
            @create="onCreate"
          />
        </UFormField>
      </template>

      <!-- The upload sits at the far end, its rule with it -->
      <div aria-hidden="true" :class="[divider, 'sm:ms-auto']" />
      <UButton
        :label="hasFile ? 'Replace SVG' : 'Upload SVG'"
        icon="hugeicons:upload-04"
        :color="hasFile ? 'neutral' : 'primary'"
        :variant="hasFile ? 'outline' : 'solid'"
        :ui="{ label: 'block' }"
        class="justify-center sm:self-center"
        @click="$emit('upload')"
      />
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

// A rule between groups: a line across when they stack, upright beside
const divider = 'border-t border-default sm:border-t-0 sm:border-s'

const typeOptions = [
  {
    label: 'Logo',
    value: 'logo',
    description: '64×64 viewBox, may contain text',
  },
  { label: 'Icon', value: 'icon', description: '24×24 viewBox, geometry only' },
]
</script>
