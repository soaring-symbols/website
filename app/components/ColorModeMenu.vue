<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'end' }"
    :ui="{ content: 'min-w-36' }"
  >
    <UButton
      :icon="current.icon"
      variant="outline"
      :ui="{ base: 'ring-default' }"
      :aria-label="`Theme: ${current.label}`"
    />
  </UDropdownMenu>
</template>

<script setup>
// Light, dark, or whichever the device is set to. The page follows the
// device until a reader picks one, and can go back to it from here
const colorMode = useColorMode()
const appConfig = useAppConfig()

// Pages are prerendered without knowing the reader's choice, so the button
// shows the device's icon until the page has loaded in the browser
const mounted = ref(false)
onMounted(() => (mounted.value = true))

const modes = computed(() => [
  { value: 'system', label: 'System', icon: appConfig.ui.icons.system },
  { value: 'light', label: 'Light', icon: appConfig.ui.icons.light },
  { value: 'dark', label: 'Dark', icon: appConfig.ui.icons.dark },
])

const preference = computed(() =>
  mounted.value ? colorMode.preference : 'system',
)

const current = computed(
  () =>
    modes.value.find(({ value }) => value === preference.value) ??
    modes.value[0],
)

const items = computed(() =>
  modes.value.map(({ value, label, icon }) => ({
    label,
    icon,
    type: 'checkbox',
    checked: preference.value === value,
    onUpdateChecked: () => (colorMode.preference = value),
    onSelect: (e) => e.preventDefault(),
  })),
)
</script>
