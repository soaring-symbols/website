<template>
  <UPageSection
    :headline="headline ?? (airline.flag_carrier ? 'Flag Carrier' : undefined)"
    :title="airline.name"
    :description="airline.branding?.tagline"
    orientation="horizontal"
    :features="features"
    :links="links"
  >
    <!-- Asset Cards -->
    <div class="flex flex-col gap-3 ml-auto">
      <div class="flex gap-3">
        <div
          class="flex-1 rounded-xl p-8 flex items-center justify-center aspect-square"
          :style="{ backgroundColor: brandColor + '12' }"
        >
          <img
            :src="`/airlines/${airline.slug}/logo.svg`"
            :alt="`${airline.name} Logo`"
            class="h-full w-full object-contain"
            @error="$event.target.style.display = 'none'"
          />
        </div>
        <div
          class="flex-1 rounded-xl p-8 flex items-center justify-center aspect-square"
          :style="{ backgroundColor: brandColor + '12' }"
        >
          <img
            :src="`/airlines/${airline.slug}/icon.svg`"
            :alt="`${airline.name} Icon`"
            class="h-3/5 w-3/5 object-contain"
            @error="$event.target.style.display = 'none'"
          />
        </div>
      </div>
      <div class="flex">
        <span class="flex-1 text-center text-sm text-muted">Logo</span>
        <span class="flex-1 text-center text-sm text-muted">Icon</span>
      </div>
      <div v-if="brandColors.length" class="flex justify-center gap-2">
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
  headline: {
    type: String,
    default: undefined,
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
  })

  items.push({
    title: `${props.airline.iata} / ${props.airline.icao}`,
    description: 'IATA / ICAO',
    icon: 'hugeicons:airplane-01',
  })

  if (props.airline.alliance) {
    items.push({
      title: props.airline.alliance,
      description: 'Alliance',
      icon: 'hugeicons:airplane-mode',
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
    },
  ]
})

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
