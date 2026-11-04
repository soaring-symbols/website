<template>
  <div class="pt-8 pb-16 sm:pt-12">
    <div class="max-w-2xl">
      <h1
        class="text-4xl font-extrabold tracking-tight text-highlighted sm:text-5xl"
      >
        {{ meta.title }}
      </h1>
      <p class="mt-3 text-lg text-toned text-pretty">{{ meta.description }}</p>
    </div>

    <!-- Filters stay in reach while the list scrolls -->
    <div
      class="sticky top-(--ui-header-height) z-10 -mx-4 mt-8 border-b border-default bg-default/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
    >
      <div class="flex flex-wrap items-center gap-3">
        <UInput
          v-model="search"
          placeholder="Airline name, IATA or ICAO code"
          icon="hugeicons:search-01"
          aria-label="Search airlines"
          class="w-full sm:w-72"
          :ui="{ base: 'bg-surface' }"
        />

        <USelect
          v-model="selectedAlliances"
          multiple
          placeholder="Any alliance"
          aria-label="Alliance"
          :items="allianceOptions"
          class="w-44"
          :ui="{ base: 'bg-surface' }"
        />

        <USelect
          v-model="selectedCountries"
          multiple
          placeholder="Any country"
          aria-label="Country"
          :items="countryOptions"
          class="w-44"
          :ui="{ base: 'bg-surface' }"
        />

        <USwitch v-model="flagCarrierOnly" label="Flag carriers only" />

        <UFieldGroup class="ms-auto" aria-label="Layout">
          <UButton
            icon="hugeicons:grid-view"
            aria-label="Grid"
            :aria-pressed="viewMode === 'grid'"
            :variant="viewMode === 'grid' ? 'solid' : 'outline'"
            @click="viewMode = 'grid'"
          />
          <UButton
            icon="hugeicons:list-view"
            aria-label="List"
            :aria-pressed="viewMode === 'list'"
            :variant="viewMode === 'list' ? 'solid' : 'outline'"
            @click="viewMode = 'list'"
          />
        </UFieldGroup>
      </div>
    </div>

    <div class="mt-6 flex items-center gap-3 text-sm text-muted" role="status">
      <span>
        <template v-if="filtered.length === total">
          All {{ total }} airlines
        </template>
        <template v-else>
          {{ filtered.length }} of {{ total }} airlines
        </template>
      </span>
      <UButton
        v-if="hasFilters"
        label="Clear filters"
        variant="link"
        size="sm"
        class="p-0"
        :ui="{ label: 'block' }"
        @click="resetFilters"
      />
    </div>

    <template v-if="paginated.length">
      <AirlineTable
        v-if="viewMode === 'list'"
        :airlines="paginated"
        class="mt-4"
        @open="open"
      />

      <ul
        v-else
        class="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <li v-for="airline in paginated" :key="airline.slug">
          <AirlineGridCard :airline="airline" @open="open" />
        </li>
      </ul>
    </template>

    <div v-else class="mt-10 max-w-md rounded-xl bg-surface p-8">
      <h2 class="text-lg font-bold text-highlighted">No airlines match</h2>
      <p class="mt-2 text-toned">
        Try a shorter name or a two-letter IATA code, or clear the filters to
        see the whole collection.
      </p>
      <UButton
        label="Clear filters"
        variant="outline"
        class="mt-4"
        :ui="{ label: 'block' }"
        @click="resetFilters"
      />
    </div>

    <div
      v-if="filtered.length > itemsPerPage"
      class="flex justify-center pt-10"
    >
      <UPagination
        v-model:page="page"
        :total="filtered.length"
        :items-per-page="itemsPerPage"
        show-edges
        active-color="neutral"
        active-variant="solid"
      />
    </div>

    <USlideover
      v-model:open="detailOpen"
      :title="active?.name ?? 'Airline'"
      :ui="{ content: 'max-w-lg', header: 'sr-only' }"
    >
      <template #body>
        <AirlineSpotlight v-if="active" :airline="active" />
      </template>
    </USlideover>
  </div>
</template>

<script setup>
const meta = {
  title: 'Browse airlines',
  description:
    'Search the collection by name or code, filter by alliance or country, and open any airline to download its logo and icon.',
}

useSeoMeta({
  title: meta.title,
  description: meta.description,
  ogTitle: meta.title,
  ogDescription: meta.description,
})

const { airlines, stats } = useAirlines()
const total = stats.total

const route = useRoute()
const router = useRouter()

const search = ref(typeof route.query.q === 'string' ? route.query.q : '')
const selectedAlliances = ref([])
const selectedCountries = ref([])
const flagCarrierOnly = ref(false)
const viewMode = ref('grid')
const page = ref(1)
const itemsPerPage = 24

// Keep the search in the URL so a result list can be shared
watch(search, (q) => {
  router.replace({ query: { ...route.query, q: q.trim() || undefined } })
})

const allianceOptions = [
  ...[...new Set(airlines.map((a) => a.alliance).filter(Boolean))]
    .sort()
    .map((a) => ({ value: a, label: a })),
  { value: '__none__', label: 'No alliance' },
]

const countryOptions = [...new Set(airlines.map((a) => a.country))]
  .sort((a, b) => countryName(a).localeCompare(countryName(b)))
  .map((code) => ({
    value: code,
    label: countryFlag(code) + ' ' + countryName(code),
  }))

const hasFilters = computed(
  () =>
    !!search.value.trim() ||
    selectedAlliances.value.length > 0 ||
    selectedCountries.value.length > 0 ||
    flagCarrierOnly.value,
)

const filtered = computed(() => {
  let list = airlines

  if (search.value.trim()) {
    const q = search.value
      .trim()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
    list = list.filter(
      (a) =>
        a.name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().includes(q) ||
        a.iata?.toLowerCase().startsWith(q) ||
        a.icao?.toLowerCase().startsWith(q),
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

const active = ref(null)
const detailOpen = ref(false)

function open(airline) {
  active.value = airline
  detailOpen.value = true
}

function resetFilters() {
  search.value = ''
  selectedAlliances.value = []
  selectedCountries.value = []
  flagCarrierOnly.value = false
}
</script>
