<template>
  <div class="flex flex-wrap items-center justify-between gap-x-5 gap-y-2">
    <UUser
      v-for="stat in statItems"
      :key="stat.label"
      :avatar="{
        icon: stat.icon,
        ui: {
          root: 'bg-transparent',
        },
      }"
      :name="stat.label"
      :description="stat.value"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  dimensions: {
    type: String,
    default: '',
  },
  paths: {
    type: Number,
    default: 0,
  },
  colors: {
    type: Number,
    default: 0,
  },
  fileSize: {
    type: String,
    default: '',
  },
  viewBox: {
    type: String,
    default: '',
  },
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
    icon: 'hugeicons:bend-tool',
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
