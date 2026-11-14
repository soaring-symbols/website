<template>
  <!-- An alliance's icon (its logo when it has no icon), or, while the
       collection has neither, a neutral group icon in its place -->
  <img
    v-if="variant"
    :src="allianceAssetUrl(alliance, variant)"
    :alt="decorative ? '' : `${alliance.name} ${variant}`"
    :aria-hidden="decorative || undefined"
    loading="lazy"
    class="object-contain"
  />
  <UIcon
    v-else
    name="solar:users-group-rounded-bold-duotone"
    class="scale-60 text-muted"
    :aria-hidden="decorative || undefined"
  />
</template>

<script setup>
const props = defineProps({
  alliance: { type: Object, required: true },
  // Beside the alliance's name, the mark adds nothing for a screen reader
  decorative: { type: Boolean, default: false },
})

const variant = computed(() => allianceMark(props.alliance))
</script>
