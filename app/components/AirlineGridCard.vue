<template>
  <UPageCard
    :title="airline.name"
    :description="`${airline.iata} / ${airline.icao}`"
    reverse
    :ui="{
      body: 'w-full',
      container: 'h-full grid grid-rows-[auto_minmax(0,1fr)]',
      description: 'text-sm',
    }"
  >
    <div
      class="rounded-lg p-4 aspect-square"
      :style="{ backgroundColor: brandColor + '12' }"
    >
      <img
        :src="`/airlines/${airline.slug}/logo.svg`"
        :alt="`${airline.name} Logo`"
        @error="$event.target.style.display = 'none'"
      />
    </div>

    <!-- <template #leading>
      {{ countryFlag(airline.country) }} {{ countryName(airline.country) }}
    </template> -->

    <template #footer>
      <UBadge v-if="airline.flag_carrier" color="primary" variant="subtle">
        {{ countryFlag(airline.country) }} Flag Carrier
      </UBadge>
      <UBadge v-if="airline.alliance" variant="subtle">
        {{ airline.alliance }}
      </UBadge>
    </template>
  </UPageCard>
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
</script>
