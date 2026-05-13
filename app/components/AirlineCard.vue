<template>
  <div class="flex items-start gap-6 py-6 border-b border-gray-200 dark:border-gray-800">
    <!-- Airline Info -->
    <div class="flex flex-col gap-2 w-56 shrink-0">
      <p class="font-semibold leading-tight">{{ airline.name }}</p>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        {{ countryFlag(airline.country) }} {{ countryName(airline.country) }}
      </p>
      <p class="text-sm text-gray-400 dark:text-gray-500 font-mono">{{ airline.iata }} / {{ airline.icao }}</p>

      <div class="flex flex-wrap gap-1 mt-1">
        <UBadge v-if="airline.flag_carrier" size="sm" color="primary" variant="subtle">
          Flag Carrier
        </UBadge>
        <UBadge v-if="airline.alliance" size="sm" color="neutral" variant="subtle">
          {{ airline.alliance }}
        </UBadge>
      </div>

      <a
        v-if="airline.website"
        :href="airline.website"
        target="_blank"
        rel="noopener noreferrer"
        class="text-sm text-primary-500 hover:underline truncate mt-1"
      >
        {{ cleanUrl(airline.website) }}
      </a>
    </div>

    <!-- Variants -->
    <div class="grid flex-1 gap-4 grid-cols-3">
      <UCard
        v-for="variant in variants"
        :key="variant.key"
        :ui="{ body: 'p-4' }"
      >
        <div
          class="flex items-center justify-center rounded-lg p-6 aspect-square"
          :style="{ backgroundColor: brandColor + '12' }"
        >
          <img
            :src="variant.src"
            :alt="`${airline.name} ${variant.label}`"
            :class="variant.key === 'icon' ? 'h-full w-auto' : 'w-full h-auto'"
            @error="$event.target.style.display = 'none'"
          />
        </div>
        <p class="text-sm text-center text-gray-500 dark:text-gray-400 mt-3">{{ variant.label }}</p>
      </UCard>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  airline: {
    type: Object,
    required: true,
  },
})

const brandColor = computed(() => props.airline.branding?.primary_color ?? '#6b7280')

const variants = computed(() =>
  ['logo', 'icon', 'tail'].map((key) => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    src: `/airlines/${props.airline.slug}/${key}.svg`,
  }))
)

function cleanUrl(url) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}
</script>
