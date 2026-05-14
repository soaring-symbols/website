<template>
  <div class="flex flex-wrap items-center gap-x-5 gap-y-2">
    <div
      v-for="stat in statItems"
      :key="stat.label"
      class="flex items-center gap-1.5 text-sm"
    >
      <UIcon :name="stat.icon" class="size-3.5 text-muted shrink-0" />
      <span class="text-muted">{{ stat.label }}</span>
      <span class="font-mono font-medium text-default">{{ stat.value }}</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  dimensions: String,
  paths: Number,
  colors: Number,
  fileSize: String,
  viewBox: String,
})

const statItems = computed(() => [
  {
    label: 'Dimensions',
    value: props.dimensions ?? '—',
    icon: 'hugeicons:resize-01',
  },
  {
    label: 'Paths',
    value: props.paths ?? 0,
    icon: 'hugeicons:bezier-curve-02',
  },
  {
    label: 'Colors',
    value: props.colors ?? 0,
    icon: 'hugeicons:paint-bucket',
  },
  {
    label: 'File Size',
    value: props.fileSize ?? '—',
    icon: 'hugeicons:file-01',
  },
  {
    label: 'viewBox',
    value: props.viewBox ?? '—',
    icon: 'hugeicons:square',
  },
])
</script>
