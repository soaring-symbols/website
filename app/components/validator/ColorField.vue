<template>
  <!-- A hex color: a swatch button that opens a picker and a hex field -->
  <UPopover :content="{ align: 'start' }">
    <UButton
      color="neutral"
      variant="outline"
      :label="valid ? model : 'Pick a color'"
      trailing-icon="solar:alt-arrow-down-linear"
      class="w-full font-mono"
      :ui="{ label: 'block flex-1 text-start', trailingIcon: 'text-dimmed' }"
    >
      <template #leading>
        <span
          class="size-4 shrink-0 rounded-sm ring ring-default"
          :style="{ background: valid ? model : undefined }"
        />
      </template>
    </UButton>

    <template #content>
      <div class="flex w-56 flex-col gap-3 p-3">
        <UColorPicker v-model="picker" class="mx-auto" />
        <UInput
          v-model="model"
          placeholder="#rrggbb"
          class="font-mono"
          aria-label="Hex color"
        />
      </div>
    </template>
  </UPopover>
</template>

<script setup>
const model = defineModel({ type: String, default: '' })

const valid = computed(() => /^#[0-9a-f]{6}$/i.test(model.value ?? ''))
// The picker writes uppercase hex; the repo writes lowercase
const picker = computed({
  get: () => (valid.value ? model.value : undefined),
  set: (value) => {
    model.value = value?.toLowerCase() ?? ''
  },
})
</script>
