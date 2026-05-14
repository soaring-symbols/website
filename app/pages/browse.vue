<template>
  <UDashboardPanel>
    <template #body>
      <UPageHeader v-bind="meta">
        <div class="flex flex-wrap items-center gap-4 mt-8">
          <UInput
            v-model="search"
            placeholder="Search airlines..."
            icon="hugeicons:search-01"
            class="w-64"
          />

          <UCheckbox v-model="flagCarrierOnly" label="Flag Carriers" />

          <USeparator orientation="vertical" class="h-5" />

          <USelect
            v-model="selectedAlliances"
            multiple
            placeholder="All Alliances"
            :items="allianceOptions"
            class="w-48"
          />

          <USelect
            v-model="selectedCountries"
            multiple
            placeholder="All Countries"
            :items="countryOptions"
            class="w-48"
          />

          <UButton
            v-if="
              search ||
              selectedAlliances.length ||
              selectedCountries.length ||
              flagCarrierOnly
            "
            label="Reset"
            variant="ghost"
            color="neutral"
            icon="hugeicons:cancel-01"
            size="sm"
            @click="resetFilters"
          />
        </div>
      </UPageHeader>

      <UPageList v-if="filtered.length" divide>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ filtered.length }} of {{ total }} airlines
        </p>

        <AirlineCard
          v-for="airline in filtered"
          :key="airline.slug"
          :airline="airline"
        />
      </UPageList>

      <UPageSection v-else title="No Airlines Found" />
    </template>
  </UDashboardPanel>
</template>

<script setup>
import airlinesData from '#airlines-data'

const meta = {
  title: 'Browse Airlines',
  description:
    'Explore the collection of airline logos, icons, and branding from airlines around the world.',
}

useSeoMeta({
  title: meta.title,
  description: meta.description,
  ogTitle: meta.title,
  ogDescription: meta.description,
})

const airlines = airlinesData

const search = ref('')
const selectedAlliances = ref([])
const selectedCountries = ref([])
const flagCarrierOnly = ref(false)

const allianceOptions = [
  ...[...new Set(airlines.map((a) => a.alliance).filter(Boolean))]
    .sort()
    .map((a) => ({ value: a, label: a })),
  { value: '__none__', label: 'No Alliance' },
]

const countryOptions = [...new Set(airlines.map((a) => a.country))]
  .sort((a, b) => countryName(a).localeCompare(countryName(b)))
  .map((code) => ({
    value: code,
    label: countryFlag(code) + ' ' + countryName(code),
  }))

const total = airlines.length

const filtered = computed(() => {
  let list = airlines

  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase()
    list = list.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.iata?.toLowerCase().includes(q) ||
        a.icao?.toLowerCase().includes(q),
    )
  }

  if (flagCarrierOnly.value) {
    list = list.filter((a) => a.flag_carrier)
  }

  if (selectedAlliances.value.length) {
    list = list.filter((a) =>
      selectedAlliances.value.includes(a.alliance ?? '__none__'),
    )
  }

  if (selectedCountries.value.length) {
    list = list.filter((a) => selectedCountries.value.includes(a.country))
  }

  return list
})

function resetFilters() {
  search.value = ''
  selectedAlliances.value = []
  selectedCountries.value = []
  flagCarrierOnly.value = false
}
</script>
