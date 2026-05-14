<template>
  <UCard>
    <div class="flex flex-wrap items-center gap-3">
      <URadioGroup
        :model-value="type"
        :items="typeOptions"
        orientation="horizontal"
        @update:model-value="$emit('update:type', $event)"
      />

      <div class="flex items-center gap-2 ms-auto">
        <UButton
          label="Upload SVG"
          icon="hugeicons:upload-04"
          color="primary"
          @click="$emit('upload')"
        />
      </div>
    </div>
  </UCard>
</template>

<script setup>
defineProps({
  type: String,
})

defineEmits(['update:type', 'upload'])

const typeOptions = [
  {
    label: 'Logo',
    value: 'logo',
    description: '64×64 viewBox, may contain text',
  },
  { label: 'Icon', value: 'icon', description: '24×24 viewBox, geometry only' },
]
</script>
