<template>
  <div class="pt-6 pb-16 sm:pt-10">
    <UBreadcrumb :items="breadcrumb" class="mb-6" />

    <AirlineHero :airline="airline" />

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
      :description="`Logos ${airline.name} used before its current ones, kept for reference, with the years each was in use.`"
      :ui="sectionUi"
    >
      <div class="flex flex-col gap-12">
        <section v-for="mark in history" :key="mark.since">
          <h3 class="mb-6 text-lg font-bold text-highlighted">
            {{ markHeading(airline, mark) }}
          </h3>
          <AirlineFileRows :airline="airline" :mark="mark" />
        </section>
      </div>
    </UPageSection>

    <!-- Names and codes the airline used before, oldest first -->
    <UPageSection
      v-if="former.length"
      id="former"
      title="Earlier names and codes"
      :description="`What ${airline.name} flew under before, with the year each stopped. A row lists only what changed then; a dash means it stayed the same.`"
      :ui="sectionUi"
      class="scroll-mt-20"
    >
      <UTable
        :data="former"
        :columns="formerColumns"
        class="rounded-lg border border-default"
      />
    </UPageSection>

    <!-- The same marks and data in code: package, CDN and API -->
    <UPageSection
      title="In your project"
      :description="`Use ${airline.name}’s marks and data in your own code, three ways. None needs a key or an account.`"
      orientation="horizontal"
      :features="usageFeatures"
      :links="[
        {
          to: '/ecosystem',
          label: 'See the ecosystem',
          trailingIcon: 'solar:arrow-right-linear',
          variant: 'outline',
          size: 'md',
          ui: { label: 'block' },
        },
      ]"
      :ui="{ ...sectionUi, features: 'gap-5', footer: 'mt-6' }"
    >
      <AirlineUsage :airline="airline" />
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
const marksSince = currentMarksSince(airline)
const filesDescription = [
  marksSince && `${airline.name} has used these marks since ${marksSince}.`,
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

// What each tab of the usage block is for, beside it
const usageFeatures = [
  {
    title: 'npm package',
    description:
      'Every SVG with the airline’s data, typed, for Node and the browser. Look it up by code or name and get file paths to bundle.',
    icon: 'simple-icons:npm',
  },
  {
    title: 'CDN',
    description:
      'Link a file straight from the package on jsDelivr or unpkg, with nothing to install. Pin a release line to keep it stable.',
    icon: 'solar:global-linear',
  },
  {
    title: 'API',
    description:
      'Fetch the data as JSON, or any mark as SVG or PNG, with monochrome marks in the color you pick.',
    icon: 'solar:code-square-linear',
  },
]

const breadcrumb = [
  { label: 'Browse', to: '/browse', icon: 'solar:plane-linear' },
  { label: airline.name },
]

// Older marks, newest first
const history = markHistory(airline)

// Former names and codes, oldest first, one row each
const former = formerIdentities(airline).map((item) => ({
  name: item.name ?? '—',
  iata: item.iata ?? '—',
  icao: item.icao ?? '—',
  callsign: item.callsign ?? '—',
  until: item.until,
}))
const formerColumns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'iata', header: 'IATA' },
  { accessorKey: 'icao', header: 'ICAO' },
  { accessorKey: 'callsign', header: 'Callsign' },
  { accessorKey: 'until', header: 'Until' },
]

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
