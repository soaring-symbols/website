<template>
  <div class="pt-8 pb-16 sm:pt-12">
    <UPageHeader :title="meta.title" :description="meta.description" />

    <!-- Filters stay in reach while the list scrolls; on phones the bar
         would cover a third of the screen, so it scrolls away there -->
    <div
      class="z-10 sm:sticky sm:top-(--ui-header-height) -mx-4 mt-8 border-b border-default bg-default/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
    >
      <div class="grid grid-cols-2 items-center gap-3 sm:flex sm:flex-wrap">
        <UInput
          v-model="search"
          placeholder="Name, code or callsign"
          icon="hugeicons:search-01"
          aria-label="Search airlines"
          class="col-span-2 w-full sm:w-72"
          :ui="{ base: 'bg-surface' }"
        />

        <USelect
          v-model="selectedAlliances"
          multiple
          placeholder="Any alliance"
          aria-label="Alliance"
          :items="allianceOptions"
          class="w-full sm:w-44"
          :ui="{ base: 'bg-surface' }"
        />

        <USelect
          v-model="selectedCountries"
          multiple
          placeholder="Any country"
          aria-label="Country"
          :items="countryOptions"
          class="w-full sm:w-44"
          :ui="{ base: 'bg-surface' }"
        >
          <template #item-leading="{ item }">
            <CountryFlags :iso="item.value" />
          </template>
        </USelect>

        <USwitch v-model="flagCarrierOnly" label="Flag carriers only" />

        <ViewToggle
          v-model="viewMode"
          label="Layout"
          :options="[
            { value: 'grid', icon: 'hugeicons:grid-view', ariaLabel: 'Grid' },
            { value: 'list', icon: 'hugeicons:list-view', ariaLabel: 'List' },
          ]"
          class="justify-self-end sm:ms-auto"
        />
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
      :ui="{
        content: 'max-w-lg divide-none',
        header: 'min-h-0 justify-end pb-0',
        title: 'sr-only',
        close: 'static',
      }"
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

defineOgImage('Site', { title: meta.title, description: meta.description })

const { airlines, stats } = useAirlines()
const total = stats.total

const route = useRoute()
const router = useRouter()

// The prerendered page has no query string, so read ?q once it is live
// rather than during setup, keeping the server and client lists the same
const search = ref('')
const selectedAlliances = ref([])
const selectedCountries = ref([])
const flagCarrierOnly = ref(false)
const viewMode = ref('grid')
const page = ref(1)
const itemsPerPage = 24

onMounted(() => {
  if (typeof route.query.q === 'string') search.value = route.query.q
})

// Keep the search in the URL so a result list can be shared. force, since
// hydrating a prerendered page leaves the route holding ?q while the address
// bar has dropped it, and the router would skip the replace as a duplicate.
watch(search, (q) => {
  router.replace({
    query: { ...route.query, q: q.trim() || undefined },
    force: true,
  })
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
    label: countryName(code),
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
    const matches = (name) =>
      name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().includes(q)
    list = list.filter(
      (a) =>
        // A renamed airline is found by its old names too
        [a.name, ...previousNames(a)].some(matches) ||
        a.iata?.toLowerCase().startsWith(q) ||
        a.icao?.toLowerCase().startsWith(q) ||
        a.callsign?.toLowerCase().includes(q),
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
