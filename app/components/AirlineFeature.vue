<template>
  <UPageSection
    :headline="airline.flag_carrier ? 'Flag Carrier' : undefined"
    :title="airline.name"
    :description="airline.branding?.tagline"
    orientation="horizontal"
    :features="features"
    :links="links"
  >
    <!-- Logo Panel -->
    <div
      class="flex flex-col items-center justify-center gap-6 rounded-xl p-12"
      :style="{ backgroundColor: brandColor + '18' }"
    >
      <img
        :src="logoSrc"
        :alt="airline.name"
        class="h-auto object-contain"
        @error="onLogoError"
      />

      <!-- Brand Color Swatches -->
      <div v-if="brandColors.length" class="flex gap-2">
        <div
          v-for="color in brandColors"
          :key="color"
          class="size-4 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"
          :style="{ backgroundColor: color }"
          :title="color"
        />
      </div>
    </div>
  </UPageSection>
</template>

<script setup>
const props = defineProps({
  airline: {
    type: Object,
    required: true,
  },
})

const brandColor = computed(
  () => props.airline.branding?.primary_color ?? '#6b7280',
)

const brandColors = computed(() => {
  const colors = props.airline.branding?.colors
  return [...new Set([...(colors?.logo ?? []), ...(colors?.icon ?? [])])].slice(
    0,
    6,
  )
})

const features = computed(() => {
  const items = []

  items.push({
    title: countryName(props.airline.country),
    description: countryFlag(props.airline.country),
    icon: 'hugeicons:global',
    orientation: 'horizontal',
  })

  items.push({
    title: `${props.airline.iata} / ${props.airline.icao}`,
    description: 'IATA / ICAO',
    icon: 'hugeicons:airplane-01',
    orientation: 'horizontal',
  })

  if (props.airline.alliance) {
    items.push({
      title: props.airline.alliance,
      description: 'Alliance',
      icon: 'hugeicons:airplane-mode',
      orientation: 'horizontal',
    })
  }

  return items
})

const links = computed(() => {
  if (!props.airline.website) return []
  return [
    {
      label: cleanUrl(props.airline.website),
      icon: 'hugeicons:link-01',
      to: props.airline.website,
      target: '_blank',
      variant: 'outline',
      color: 'neutral',
    },
  ]
})

const logoSrc = ref(`/airlines/${props.airline.slug}/logo.svg`)
watch(
  () => props.airline.slug,
  (slug) => {
    logoSrc.value = `/airlines/${slug}/logo.svg`
  },
)

function onLogoError() {
  if (logoSrc.value.endsWith('/logo.svg')) {
    logoSrc.value = `/airlines/${props.airline.slug}/icon.svg`
  }
}

function countryFlag(iso) {
  return [...iso.toUpperCase()]
    .map((c) => String.fromCodePoint(c.charCodeAt(0) + 127397))
    .join('')
}

function countryName(iso) {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(iso) ?? iso
  } catch {
    return iso
  }
}

function cleanUrl(url) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}
</script>
