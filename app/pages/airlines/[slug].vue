<template>
  <div class="pt-6 pb-16 sm:pt-10">
    <UBreadcrumb :items="breadcrumb" class="mb-6" />

    <AirlineSpotlight :airline="airline" heading-tag="h1" :page-link="false" />

    <!-- Every SVG the airline ships, with where to get it -->
    <UPageSection
      title="Files"
      :description="filesDescription"
      class="mt-16"
      :ui="sectionUi"
    >
      <AirlineFileRows :airline="airline" />
    </UPageSection>

    <!-- Marks the airline used before its current ones, newest first -->
    <UPageSection
      v-if="history.length"
      title="Earlier marks"
      :description="`Logos ${airline.name} used before its current ones, kept for reference. Each was used from the year shown until the next one, the newest until today's marks.`"
      :ui="sectionUi"
    >
      <div class="flex flex-col gap-12">
        <section v-for="mark in history" :key="mark.since">
          <h3 class="mb-6 text-lg font-bold text-highlighted">
            Introduced {{ mark.since }}
          </h3>
          <AirlineFileRows
            :airline="airline"
            :since="mark.since"
            :assets="mark.assets"
            heading-tag="h4"
          />
        </section>
      </div>
    </UPageSection>

    <!-- The same data from the package -->
    <UPageSection
      title="In your project"
      :description="`Look ${airline.name} up in the npm package by its IATA code, ICAO code or name.`"
      orientation="horizontal"
      :links="[
        {
          to: '/#use',
          label: 'Install the package',
          trailingIcon: 'hugeicons:arrow-right-02',
          variant: 'outline',
          size: 'md',
          ui: { label: 'block' },
        },
      ]"
      :ui="{ ...sectionUi, footer: 'mt-6' }"
    >
      <pre
        class="overflow-x-auto rounded-xl bg-board p-5 font-mono text-[0.8125rem] leading-relaxed text-flap-ink"
      ><code><span class="text-flap-ink/50">import</span> { getAirline, getAssetPath } <span class="text-flap-ink/50">from</span> 'soaring-symbols'

getAirline('{{ lookupCode }}')
getAssetPath('{{ lookupCode }}', '{{ snippetVariant ?? 'logo' }}')
<span class="text-flap-ink/50">// {{ snippetPath }}</span><template v-if="historySnippet">
getAssetPath('{{ lookupCode }}', '{{ historySnippet.variant }}', { since: {{ historySnippet.since }} })
<span class="text-flap-ink/50">// '{{ historySnippet.path }}'</span></template></code></pre>
    </UPageSection>
  </div>
</template>

<script setup>
const route = useRoute()
const { airlines } = useAirlines()

const airline = airlines.find((a) => a.slug === route.params.slug)

if (!airline) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Airline not found',
    fatal: true,
  })
}

// An airline drawn with another's marks says whose they are; the files are
// still published under its own slug
const markOwner = airlineBySlug(airline.marks)
const filesDescription = [
  markOwner &&
    `${airline.name} flies the same marks as ${markOwner.name}, published under its own name too.`,
  'Download a file, or link it straight from the npm package through jsDelivr. Monochrome files use currentColor, so they take the color of the text around them.',
]
  .filter(Boolean)
  .join(' ')

// Sections here sit closer together, under smaller titles, than on the home page
const sectionUi = {
  container: 'py-12 sm:py-12 lg:py-12 gap-8 sm:gap-8',
  title: 'text-2xl sm:text-2xl lg:text-2xl',
  description: 'mt-2',
}
const lookupCode = airline.iata || airline.icao

const breadcrumb = [
  { label: 'Browse', to: '/browse', icon: 'hugeicons:airplane-01' },
  { label: airline.name },
]

const ASSET_TYPES = ['logo', 'icon', 'tail']

// The package snippet shows the first color file the airline ships
const snippetVariant = ASSET_TYPES.find((type) => hasAsset(airline, type))
const snippetPath = snippetVariant
  ? `'soaring-symbols/assets/${airline.slug}/${snippetVariant}.svg'`
  : 'undefined'

// Older marks, newest first
const history = markHistory(airline)

// The snippet also shows how to get the newest older mark, when there is one
const newest = history[0]
const newestVariant =
  newest && ASSET_TYPES.find((type) => hasAsset(airline, type, newest.assets))
const historySnippet = newestVariant && {
  since: newest.since,
  variant: newestVariant,
  path: `soaring-symbols/assets/${assetDir(airline, newest.since)}/${newestVariant}.svg`,
}

const description = [
  `Logo, icon and brand colors of ${airline.name}`,
  `(${[airline.iata, airline.icao].filter(Boolean).join(' / ')}),`,
  `${countryName(airline.country)}, as SVG.`,
].join(' ')

useSeoMeta({
  title: airline.name,
  description,
  ogTitle: `${airline.name} logo and icon`,
  ogDescription: description,
  twitterTitle: `${airline.name} logo and icon`,
  twitterDescription: description,
})

defineOgImage('Airline', {
  name: airline.name,
  codes: [airline.iata, airline.icao].filter(Boolean),
  country: countryName(airline.country),
  logo: assetUrl(airline, 'logo'),
  color: brandColor(airline),
})
</script>
