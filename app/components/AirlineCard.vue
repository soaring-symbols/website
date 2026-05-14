<template>
  <div class="relative grid grid-cols-3 items-start gap-6 py-6">
    <!-- Airline Info -->
    <div class="flex flex-col gap-2">
      <p class="font-semibold leading-tight">{{ airline.name }}</p>
      <p class="text-sm text-muted">
        {{ countryFlag(airline.country) }} {{ countryName(airline.country) }}
      </p>
      <p class="text-sm font-mono text-muted">
        {{ airline.iata }} / {{ airline.icao }}
      </p>

      <div class="flex flex-wrap gap-1 mt-1">
        <UBadge
          v-if="airline.flag_carrier"
          size="sm"
          color="primary"
          variant="subtle"
        >
          Flag Carrier
        </UBadge>
        <UBadge
          v-if="airline.alliance"
          size="sm"
          color="neutral"
          variant="subtle"
        >
          {{ airline.alliance }}
        </UBadge>
      </div>

      <UButton
        v-if="airline.website"
        :to="airline.website"
        target="_blank"
        variant="link"
        color="primary"
        size="sm"
        :label="cleanUrl(airline.website)"
        class="mt-1 px-0 max-w-full"
      />
    </div>

    <!-- Logo -->
    <UCard :ui="{ body: 'p-4' }">
      <div
        class="flex items-center justify-center rounded-lg p-4 aspect-square"
        :style="{ backgroundColor: brandColor + '12' }"
      >
        <img
          :src="`/airlines/${airline.slug}/logo.svg`"
          :alt="`${airline.name} Logo`"
          class="w-full h-auto"
          @error="$event.target.style.display = 'none'"
        />
      </div>
      <p class="text-sm text-center text-muted mt-3">Logo</p>
    </UCard>

    <!-- Icon -->
    <UCard :ui="{ body: 'p-4' }">
      <div
        class="flex items-center justify-center rounded-lg p-4 aspect-square"
        :style="{ backgroundColor: brandColor + '12' }"
      >
        <img
          :src="`/airlines/${airline.slug}/icon.svg`"
          :alt="`${airline.name} Icon`"
          class="h-2/5 w-auto"
          @error="$event.target.style.display = 'none'"
        />
      </div>
      <p class="text-sm text-center text-muted mt-3">Icon</p>
    </UCard>
  </div>
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

function cleanUrl(url) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}
</script>
