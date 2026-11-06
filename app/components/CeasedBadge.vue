<template>
  <UBadge
    v-if="label"
    :label="label"
    color="neutral"
    variant="subtle"
    size="sm"
    class="shrink-0"
  />
</template>

<script setup>
// Marks an airline that has ceased operations, wherever it is listed
const props = defineProps({
  airline: { type: Object, required: true },
})

const label = computed(() => ceasedLabel(props.airline))
</script>
