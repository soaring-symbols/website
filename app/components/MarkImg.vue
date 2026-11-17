<template>
  <!-- A mark as the page's theme needs it: in dark mode, its -dark.svg
       when the package ships one, else the color file. Put darkTile() on
       the tile behind it, so a dark file sits on a dark ground. -->
  <img
    v-bind="$attrs"
    :src="assetUrl(entry, variant, mark, source)"
    :alt="alt"
    :loading="loading"
    :class="[imgClass, hasDark && 'dark:hidden']"
  />
  <img
    v-if="hasDark"
    v-bind="$attrs"
    :src="assetUrl(entry, `${variant}-dark`, mark, source)"
    :alt="alt"
    :loading="loading"
    :class="[imgClass, 'hidden dark:block']"
  />
</template>

<script setup>
// Two roots: attributes such as aria-hidden or an extra class go on both
defineOptions({ inheritAttrs: false })

const props = defineProps({
  entry: { type: Object, required: true },
  // A color variant: 'logo', 'icon' or 'tail'
  variant: { type: String, required: true },
  alt: { type: String, default: '' },
  loading: { type: String, default: undefined },
  imgClass: {
    type: [String, Array, Object],
    default: 'size-full object-contain',
  },
  mark: { type: Object, default: undefined },
  source: { type: String, default: 'airlines' },
})

const hasDark = computed(() =>
  hasAsset(props.entry, `${props.variant}-dark`, props.mark),
)
</script>
