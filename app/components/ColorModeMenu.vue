<template>
  <!-- Opens on hover; a tap opens it too, as a touch screen has no hover,
       and a tap outside closes it. A click only opens, so it can't close
       what the hover has just opened -->
  <UPopover
    v-model:open="open"
    mode="hover"
    :open-delay="0"
    :close-delay="150"
    :content="{ align: 'end' }"
  >
    <UButton
      :icon="current.icon"
      variant="outline"
      :ui="{ base: 'ring-default' }"
      :aria-label="`Theme: ${current.label}`"
      :aria-expanded="open"
      @click="open = true"
    />

    <template #content>
      <div class="flex min-w-36 flex-col p-1">
        <UButton
          v-for="mode in modes"
          :key="mode.value"
          :label="mode.label"
          :icon="mode.icon"
          :trailing-icon="
            preference === mode.value ? appConfig.ui.icons.check : undefined
          "
          :aria-pressed="preference === mode.value"
          color="neutral"
          variant="ghost"
          size="sm"
          block
          :ui="{
            base: 'justify-start',
            label: 'block',
            trailingIcon: 'ms-auto',
          }"
          @click="colorMode.preference = mode.value"
        />
      </div>
    </template>
  </UPopover>
</template>

<script setup>
// Light, dark, or whichever the device is set to. The page follows the
// device until a reader picks one, and can go back to it from here
const colorMode = useColorMode()
const appConfig = useAppConfig()

const open = ref(false)

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
</script>
