<template>
  <!-- An alliance's icon (its logo when it has no icon), or, while the
       collection has neither, a neutral group icon in its place -->
  <MarkImg
    v-if="variant"
    :entry="alliance"
    :variant="variant"
    source="alliances"
    :alt="decorative ? '' : `${alliance.name} ${variant}`"
    :aria-hidden="decorative || undefined"
    loading="lazy"
    :img-class="['object-contain', $attrs.class]"
  />
  <UIcon
    v-else
    name="solar:users-group-rounded-bold-duotone"
    class="scale-60 text-muted"
    :class="$attrs.class"
    :aria-hidden="decorative || undefined"
  />
</template>

<script setup>
// The class goes on the mark's images, which MarkImg renders as two roots
defineOptions({ inheritAttrs: false })

const props = defineProps({
  alliance: { type: Object, required: true },
  // Beside the alliance's name, the mark adds nothing for a screen reader
  decorative: { type: Boolean, default: false },
})

const variant = computed(() => allianceMark(props.alliance))
</script>
