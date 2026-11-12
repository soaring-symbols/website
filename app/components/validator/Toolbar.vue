<template>
  <UCard>
    <!-- Two labeled settings for the checks and the fix, then the upload,
         each group set apart by a rule: across on phones, upright beside -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-stretch">
      <!-- What the file is: the checks and the fix follow both. Each is
           guessed from the upload until picked by hand. -->
      <div class="flex flex-col gap-3 shrink-0">
        <UFormField
          v-for="field in fields"
          :key="field.label"
          :label="field.label"
          :hint="
            field.guess.from
              ? `Detected from the ${field.guess.from}`
              : undefined
          "
          :ui="{ hint: 'text-xs' }"
        >
          <URadioGroup
            :model-value="field.guess.value"
            :items="field.options"
            orientation="horizontal"
            :ui="{ fieldset: columns }"
            @update:model-value="field.guess.pick($event)"
          />
        </UFormField>
      </div>

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
const props = defineProps({
  // useGuess() of 'logo' or 'icon', and of 'color' or 'mono' (a -mono.svg,
  // drawn in currentColor)
  type: { type: Object, required: true },
  variant: { type: Object, required: true },
  // An SVG is loaded, so the button replaces it
  hasFile: Boolean,
  airline: { type: String, default: null },
})

const emit = defineEmits(['update:airline', 'upload'])

// Catalog names, after any typed for an airline it doesn't have yet (the
// menu only shows a value that is one of its items)
const catalogNames = useAirlines().airlines.map((a) => a.name)
const created = ref([])
const airlineNames = computed(() => [...created.value, ...catalogNames])

function onCreate(name) {
  if (!created.value.includes(name)) created.value.unshift(name)
  emit('update:airline', name)
}

// Type and Variant share two columns, so Icon sits above Mono
const columns = 'grid grid-cols-2 gap-x-8'

// A rule between groups: a line across when they stack, upright beside
const divider = 'border-t border-default sm:border-t-0 sm:border-s'

const variantOptions = [
  { label: 'Color', value: 'color', description: 'Its own colors' },
  { label: 'Mono', value: 'mono', description: 'In currentColor' },
]

const typeOptions = [
  {
    label: 'Logo',
    value: 'logo',
    description: '64×64 viewBox, may contain text',
  },
  { label: 'Icon', value: 'icon', description: '24×24 viewBox, geometry only' },
]

// The two guesses, in the order they are shown
const fields = computed(() => [
  { label: 'Type', guess: props.type, options: typeOptions },
  { label: 'Variant', guess: props.variant, options: variantOptions },
])
</script>
