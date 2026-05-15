<template>
  <UDashboardPanel>
    <template #body>
      <UPageHeader v-bind="meta" />

      <UCard>
        <div class="flex flex-row flex-wrap items-center gap-3">
          <UFieldGroup>
            <UButton
              icon="hugeicons:grid-view"
              :variant="viewMode === 'grid' ? 'subtle' : 'outline'"
              :color="viewMode === 'grid' ? 'primary' : 'neutral'"
              @click="viewMode = 'grid'"
            />
            <UButton
              icon="hugeicons:list-view"
              :variant="viewMode === 'list' ? 'subtle' : 'outline'"
              :color="viewMode === 'list' ? 'primary' : 'neutral'"
              @click="viewMode = 'list'"
            />
          </UFieldGroup>

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

          <UCheckbox v-model="flagCarrierOnly" label="Flag Carriers" />

          <UButton
            v-if="
              search ||
              selectedAlliances.length ||
              selectedCountries.length ||
              flagCarrierOnly
            "
            label="Reset"
            variant="ghost"
            icon="hugeicons:cancel-01"
            size="sm"
            @click="resetFilters"
          />

          <div class="flex items-center gap-2 ms-auto">
            <UInput
              v-model="search"
              placeholder="Search airlines..."
              icon="hugeicons:search-01"
              class="w-64"
            />
          </div>

          <USeparator orientation="vertical" class="h-5" />

          <span class="text-sm text-muted"
            >{{ filtered.length }} of {{ total }} airlines</span
          >
        </div>
      </UCard>

      <template v-if="paginated.length">
        <UPageList v-if="viewMode === 'list'" divide>
          <AirlineCard
            v-for="airline in paginated"
            :key="airline.slug"
            :airline="airline"
          />
        </UPageList>

        <UPageGrid v-else>
          <AirlineGridCard
            v-for="airline in paginated"
            :key="airline.slug"
            :airline="airline"
          />
        </UPageGrid>
      </template>

      <UPageSection v-else title="No Airlines Found" />

      <div
        v-if="filtered.length > itemsPerPage"
        class="flex justify-center py-6"
      >
        <UPagination
          v-model:page="page"
          :total="filtered.length"
          :items-per-page="itemsPerPage"
          show-edges
        />
      </div>
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
const viewMode = ref('grid')
const page = ref(1)
const itemsPerPage = 20

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

const paginated = computed(() => {
  const start = (page.value - 1) * itemsPerPage
  return filtered.value.slice(start, start + itemsPerPage)
})

watch(filtered, () => {
  page.value = 1
})

function resetFilters() {
  search.value = ''
  selectedAlliances.value = []
  selectedCountries.value = []
  flagCarrierOnly.value = false
}
</script>
