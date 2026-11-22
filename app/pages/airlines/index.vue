<template>
  <div class="pt-8 pb-16 sm:pt-12">
    <UPageHeader :title="meta.title" :description="meta.description" />

    <!-- Filters stay in reach while the list scrolls; on phones the bar
         would cover a third of the screen, so it scrolls away there -->
    <div
      class="z-10 sm:sticky sm:top-(--ui-header-height) -mx-4 mt-8 bg-default/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
    >
      <div class="grid grid-cols-2 items-center gap-3 sm:flex sm:flex-wrap">
        <UInput
          v-model="search"
          placeholder="Name, code or callsign"
          icon="solar:magnifier-linear"
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

        <USelectMenu
          v-model="selectedCountries"
          multiple
          value-key="value"
          placeholder="Any country"
          aria-label="Country"
          :items="countryOptions"
          :search-input="{ placeholder: 'Search countries' }"
          class="w-full sm:w-44"
          :ui="{ base: 'bg-surface' }"
        >
          <template #item-leading="{ item }">
            <CountryFlag :iso="item.value" />
          </template>
        </USelectMenu>

        <USelect
          v-model="selectedType"
          aria-label="Type"
          :items="typeOptions"
          class="w-full sm:w-36"
          :ui="{ base: 'bg-surface' }"
        />

        <USwitch v-model="flagCarrierOnly" label="Flag carriers only" />
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

    <ul
      v-if="filtered.length"
      class="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <li v-for="airline in filtered" :key="airline.slug">
        <AirlineGridCard :airline="airline" @open="open" />
      </li>
    </ul>

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

    <USlideover
      v-model:open="detailOpen"
      :title="active?.name ?? 'Airline'"
      :ui="{
        content: 'max-w-lg divide-none',
        // The close button floats on the cover's corner instead of taking
        // a row of its own above it
        header: 'absolute inset-x-0 top-0 z-10 min-h-0 p-0',
        title: 'sr-only',
        close:
          'top-6 end-6 rounded-full bg-default/80 ring ring-default backdrop-blur sm:top-8 sm:end-8',
      }"
    >
      <template #body>
        <AirlineSpotlight v-if="active" :airline="active" />
      </template>

      <!-- The airline's page lists every file to download -->
      <template v-if="active" #footer>
        <UButton
          :to="`/airlines/${active.slug}`"
          label="Files &amp; details"
          trailing-icon="solar:arrow-right-linear"
          size="lg"
          block
          color="primary"
          variant="solid"
          :ui="{ label: 'block' }"
        />
      </template>
    </USlideover>
  </div>
</template>

<script setup>
import flagIcons from 'flag-icons/country.json'

const meta = {
  title: 'Airlines',
  description:
    'Search the collection by name or code, filter by alliance, country or type, and open any airline for its logo, icon and colors.',
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
const selectedType = ref('all')
const flagCarrierOnly = ref(false)

// The filters in the URL: ?q=, ?alliance= (alliance slugs, `none` for no
// alliance), ?country= (ISO codes), ?cargo=true|false as in the API, ?flag=true
// lists comma-separated. A value it doesn't know is dropped.
const NO_ALLIANCE = '__none__'
const queryList = (value) =>
  typeof value === 'string' ? value.split(',').filter(Boolean) : []

onMounted(() => {
  const query = route.query
  if (typeof query.q === 'string') search.value = query.q

  selectedAlliances.value = queryList(query.alliance)
    .map((slug) =>
      slug === 'none'
        ? NO_ALLIANCE
        : alliances.find((a) => a.slug === slug)?.name,
    )
    .filter(Boolean)
  selectedCountries.value = queryList(query.country)
    .map((code) => code.toUpperCase())
    .filter((code) => countryOptions.some((c) => c.value === code))
  if (query.cargo === 'true') selectedType.value = 'cargo'
  if (query.cargo === 'false') selectedType.value = 'passenger'
  flagCarrierOnly.value = query.flag === 'true'
})

// Keep the filters in the URL so a result list can be shared and the back
// button returns to it. The whole query is built from the filters at once,
// since two replaces in a row would each start from the route before the
// other. force, since hydrating a prerendered page leaves the route holding the
// query while the address bar has dropped it, and the router would skip the
// replace as a duplicate.
const joined = (list) => (list.length ? list.join(',') : undefined)

const urlQuery = computed(() => ({
  q: search.value.trim() || undefined,
  alliance: joined(
    selectedAlliances.value.map((name) =>
      name === NO_ALLIANCE ? 'none' : allianceByName(name)?.slug,
    ),
  ),
  country: joined(selectedCountries.value),
  cargo:
    selectedType.value === 'all'
      ? undefined
      : String(selectedType.value === 'cargo'),
  flag: flagCarrierOnly.value ? 'true' : undefined,
  // The list has no pages any more; drop ?page from links made before
  page: undefined,
}))

watch(urlQuery, (query) => {
  router.replace({ query: { ...route.query, ...query }, force: true })
})

// Every alliance in the catalog, active ones first. An active alliance
// finds its members (those that ceased while in it included); a disbanded
// one, every airline that flew in it, since none is a member any more.
const { alliances } = useAlliances()
const toOption = (a) => ({ value: a.name, label: a.name })
const allianceOptions = [
  alliances.filter((a) => !a.defunct).map(toOption),
  [
    { type: 'label', label: 'Disbanded' },
    ...alliances.filter((a) => a.defunct).map(toOption),
  ],
  [{ value: NO_ALLIANCE, label: 'No alliance' }],
]

function inAlliances(airline, names) {
  if (names.includes(airline.alliance ?? NO_ALLIANCE)) return true

  return (airline.alliance_history ?? []).some(
    (item) =>
      names.includes(item.alliance) && allianceByName(item.alliance)?.defunct,
  )
}

// Every country flag-icons has a flag for, whether or not the collection
// has an airline from it yet, by English name
const collator = new Intl.Collator('en')
const countryOptions = flagIcons
  .filter((country) => country.iso)
  .map((country) => {
    const value = country.code.toUpperCase()

    return { value, label: countryName(value) }
  })
  .sort((a, b) => collator.compare(a.label, b.label))

// Passenger airlines, or those that fly only freight and the cargo brands
// of passenger airlines (`cargo`)
const typeOptions = [
  { value: 'all', label: 'Any type' },
  { value: 'passenger', label: 'Passenger' },
  { value: 'cargo', label: 'Cargo' },
]

const hasFilters = computed(
  () =>
    !!search.value.trim() ||
    selectedAlliances.value.length > 0 ||
    selectedCountries.value.length > 0 ||
    selectedType.value !== 'all' ||
    flagCarrierOnly.value,
)

const filtered = computed(() => {
  let list = airlines

  if (search.value.trim()) list = searchAirlines(list, search.value)

  if (selectedType.value !== 'all') {
    const cargo = selectedType.value === 'cargo'
    list = list.filter((a) => !!a.cargo === cargo)
  }

  if (flagCarrierOnly.value) {
    list = list.filter((a) => a.flag_carrier)
  }

  if (selectedAlliances.value.length) {
    list = list.filter((a) => inAlliances(a, selectedAlliances.value))
  }

  if (selectedCountries.value.length) {
    // A subdivision such as GB-SCT counts as its country
    list = list.filter((a) =>
      selectedCountries.value.includes(a.country.slice(0, 2)),
    )
  }

  return list
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
  selectedType.value = 'all'
  flagCarrierOnly.value = false
}
</script>
