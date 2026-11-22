<template>
  <!-- Search the whole site from any page: ⌘K (Ctrl+K elsewhere) opens
       it, as does the home page's search button, and picking a result goes
       to its page. Its own theme commands come last, after the links -->
  <UDashboardSearch
    v-model:open="open"
    v-model:search-term="term"
    :groups="groups"
    title="Search"
    description="Find an airline, an alliance or a page"
    placeholder="Airline, code, callsign or page"
    :ui="{ modal: 'sm:max-w-xl' }"
  >
    <!-- The airline's icon, or its logo when it has no icon, on the
         tile the grid's cards use -->
    <template #airline-leading="{ item }">
      <span
        class="grid size-7 shrink-0 place-items-center overflow-hidden rounded-md bg-tile p-1"
        :class="darkTile(item.airline, item.variant)"
      >
        <MarkImg
          v-if="item.variant"
          :entry="item.airline"
          :variant="item.variant"
          loading="lazy"
        />
      </span>
    </template>

    <template #alliance-leading="{ item }">
      <span
        class="grid size-7 shrink-0 place-items-center overflow-hidden rounded-md bg-tile p-1"
        :class="item.variant && darkTile(item.alliance, item.variant)"
      >
        <MarkImg
          v-if="item.variant"
          :entry="item.alliance"
          :variant="item.variant"
          source="alliances"
          loading="lazy"
        />
      </span>
    </template>
  </UDashboardSearch>
</template>

<script setup>
const { open, term } = useSiteSearch()

const { airlines } = useAirlines()
const { alliances } = useAlliances()

// The icon reads best at this size; an airline without one shows its logo
const airlineVariant = (airline) =>
  ['icon', 'logo'].find((variant) => hasAsset(airline, variant))

// Airlines are found the way the airlines page finds them, rather than by
// Fuse's fuzzy match, so a code such as VN finds Vietnam Airlines first
const airlineItems = computed(() =>
  term.value.trim()
    ? searchAirlines(airlines, term.value)
        .slice(0, 12)
        .map((airline) => ({
          label: airline.name,
          suffix: airline.iata ?? airline.icao,
          description: countryName(airline.country),
          to: `/airlines/${airline.slug}`,
          slot: 'airline',
          airline,
          variant: airlineVariant(airline),
        }))
    : [],
)

const allianceItems = alliances.map((alliance) => ({
  label: alliance.name,
  suffix: alliance.defunct ? 'Disbanded' : undefined,
  to: `/alliances/${alliance.slug}`,
  slot: 'alliance',
  alliance,
  variant: allianceMark(alliance),
}))

const pageItems = [
  { label: 'Home', to: '/', icon: 'solar:home-2-linear' },
  { label: 'Airlines', to: '/airlines', icon: 'solar:plane-linear' },
  {
    label: 'Alliances',
    to: '/alliances',
    icon: 'solar:users-group-rounded-linear',
  },
  { label: 'Validate', to: '/validate', icon: 'solar:check-circle-linear' },
  {
    label: 'Files and APIs',
    to: '/ecosystem#data',
    icon: 'solar:code-square-linear',
  },
  {
    label: 'Apps and plugins',
    to: '/ecosystem#apps',
    icon: 'solar:widget-add-linear',
  },
  { label: 'Changelog', to: '/changelog', icon: 'solar:history-linear' },
  { label: 'Brand', to: '/brand', icon: 'solar:pallete-2-linear' },
]

// The airlines page with every match, filtered by the same search, for
// more than the palette lists or to narrow them down further
const allMatches = computed(() => {
  const q = term.value.trim()
  return airlineItems.value.length
    ? [
        {
          label: `See all airlines matching “${q}”`,
          to: { path: '/airlines', query: { q } },
          icon: 'solar:list-linear',
        },
      ]
    : []
})

// Off the site: the project, its package, and what to read before using or
// adding to the marks
const linkItems = [
  {
    label: 'GitHub',
    suffix: 'soaring-symbols/soaring-symbols',
    to: 'https://github.com/soaring-symbols/soaring-symbols',
    target: '_blank',
    icon: 'simple-icons:github',
  },
  {
    label: 'npm',
    suffix: 'soaring-symbols',
    to: 'https://www.npmjs.com/package/soaring-symbols',
    target: '_blank',
    icon: 'simple-icons:npm',
  },
  {
    label: 'Disclaimer',
    to: DISCLAIMER_URL,
    target: '_blank',
    icon: 'solar:justice-scale-linear',
  },
  {
    label: 'Contributing',
    to: CONTRIBUTING_URL,
    target: '_blank',
    icon: 'solar:pen-new-square-linear',
  },
  {
    label: 'Sponsor',
    to: 'https://github.com/sponsors/soaring-symbols',
    target: '_blank',
    icon: 'solar:heart-linear',
  },
]

// Before anything is typed, the pages, links and themes; then the airlines
// first, as most searches are for one
const groups = computed(() => [
  {
    id: 'airlines',
    label: 'Airlines',
    items: [...airlineItems.value, ...allMatches.value],
    ignoreFilter: true,
  },
  {
    id: 'alliances',
    label: 'Alliances',
    items: allianceItems,
    postFilter: (searchTerm, items) => (searchTerm ? items : []),
  },
  { id: 'pages', label: 'Pages', items: pageItems },
  { id: 'links', label: 'Links', items: linkItems },
])
</script>
