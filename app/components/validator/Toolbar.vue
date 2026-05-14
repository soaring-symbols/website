<template>
  <UCard>
    <div class="flex flex-wrap items-center gap-3">
      <URadioGroup
        :model-value="type"
        :items="typeOptions"
        orientation="horizontal"
        @update:model-value="$emit('update:type', $event)"
      />

      <USeparator orientation="vertical" class="h-7 hidden sm:block" />

      <p class="text-xs text-muted hidden md:block">
        {{
          type === 'logo'
            ? 'Logos — 64×64 viewBox, may contain text'
            : 'Icons — 24×24 viewBox, geometry only'
        }}
      </p>

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
  { label: 'Logo', value: 'logo' },
  { label: 'Icon', value: 'icon' },
]
</script>
