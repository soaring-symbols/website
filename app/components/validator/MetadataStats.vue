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
      :description="String(stat.value)"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  dimensions: {
    type: String,
    default: '',
  },
  // Strings let raster images show "—" for SVG-only stats
  paths: {
    type: [Number, String],
    default: 0,
  },
  colors: {
    type: [Number, String],
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
    icon: 'solar:ruler-angular-linear',
  },
  {
    label: 'Paths',
    value: props.paths ?? 0,
    icon: 'solar:pen-new-round-linear',
  },
  {
    label: 'Colors',
    value: props.colors ?? 0,
    icon: 'solar:paint-bucket-linear',
  },
  {
    label: 'File Size',
    value: props.fileSize ?? '—',
    icon: 'solar:file-linear',
  },
  {
    label: 'viewBox',
    value: props.viewBox ?? '—',
    icon: 'solar:stop-linear',
  },
])
</script>
