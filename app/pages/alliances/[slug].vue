<template>
  <div class="pt-6 pb-16 sm:pt-10">
    <UBreadcrumb :items="breadcrumb" class="mb-6" />

    <!-- Who it is: its mark, name, slogan, years and website -->
    <header
      class="grid items-center gap-6 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] lg:gap-10"
    >
      <div
        class="flex aspect-square w-40 items-center justify-center overflow-hidden rounded-xl bg-tile p-6 sm:w-auto sm:p-8"
        :style="{ backgroundImage: wash }"
      >
        <AllianceMark :alliance="alliance" class="size-full" />
      </div>

      <div class="flex min-w-0 flex-col gap-4">
        <div>
          <h1
            class="text-3xl font-extrabold tracking-tight text-highlighted text-balance sm:text-4xl"
          >
            {{ alliance.name }}
          </h1>
          <p
            v-if="alliance.branding?.tagline"
            class="mt-1.5 text-lg text-muted text-pretty"
          >
            “{{ alliance.branding.tagline }}”
          </p>
        </div>

        <ul class="flex flex-wrap items-center gap-2 text-sm">
          <li :class="chipClass">
            <UIcon
              name="solar:users-group-rounded-bold-duotone"
              class="size-4 text-muted"
            />
            <span class="cap-center">{{ memberCount }}</span>
          </li>
          <li v-if="alliance.founded" :class="chipClass">
            <UIcon
              name="solar:calendar-bold-duotone"
              class="size-4 text-muted"
            />
            <span class="cap-center"
              >{{ alliance.defunct ? 'Founded' : 'Since' }}
              {{ alliance.founded }}</span
            >
          </li>
          <li v-if="alliance.defunct" :class="chipClass">
            <UIcon
              name="solar:forbidden-circle-bold-duotone"
              class="size-4 text-muted"
            />
            <span class="cap-center">{{ disbandedLabel(alliance) }}</span>
          </li>
          <li v-if="color" :class="chipClass">
            <span
              class="size-4 rounded-full ring-1 ring-black/10 ring-inset dark:ring-white/25"
              :style="{ backgroundColor: color }"
            />
            <span class="cap-center font-mono">{{ color.toUpperCase() }}</span>
          </li>
        </ul>

        <a
          v-if="alliance.website"
          :href="alliance.website"
          target="_blank"
          rel="noopener"
          class="inline-flex w-fit max-w-full items-center gap-1.5 text-sm font-semibold text-highlighted underline decoration-accented underline-offset-4 hover:decoration-current"
        >
          <UIcon name="solar:global-bold-duotone" class="size-4 shrink-0" />
          <span class="cap-center truncate">{{
            cleanUrl(alliance.website)
          }}</span>
        </a>
      </div>
    </header>

    <!-- Every SVG the alliance ships, with where to get it -->
    <UPageSection
      title="Files"
      description="Download a file, or link it straight from the npm package through jsDelivr. Monochrome files use currentColor, so they take the color of the text around them."
      class="mt-16"
      :ui="filesUi"
    >
      <template #links>
        <DownloadAllButton :entry="alliance" source="alliances" />
      </template>

      <MarkFileRows :entry="alliance" source="alliances" />
    </UPageSection>

    <!-- The same marks and data in code: package, CDN and API -->
    <UPageSection
      title="In your project"
      :description="`Use ${alliance.name}’s ${mark ? 'marks and data' : 'data'} in your own code. None of it needs a key or an account.`"
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
      <AllianceUsage :alliance="alliance" />
    </UPageSection>

    <!-- The airlines in it, the ones that ceased while members, and the
         ones that left, one part each when it has them -->
    <UPageSection
      title="Members"
      :description="membersDescription"
      :ui="sectionUi"
    >
      <div class="flex flex-col gap-12">
        <ul
          v-if="members.length"
          class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <li v-for="airline in members" :key="airline.slug">
            <ULink :to="`/airlines/${airline.slug}`" :class="memberClass">
              <span
                class="flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-tile p-1.5"
                :style="{ backgroundImage: brandTint(airline) }"
              >
                <img
                  :src="assetUrl(airline, firstVariant(airline) ?? 'logo')"
                  alt=""
                  loading="lazy"
                  class="size-full object-contain"
                />
              </span>
              <span class="min-w-0">
                <span class="block truncate font-semibold text-highlighted">
                  {{ airline.name }}
                </span>
                <span class="flex items-center gap-1.5 text-sm text-muted">
                  <CountryFlag :iso="airline.country" />
                  <span class="truncate">{{
                    countryName(airline.country)
                  }}</span>
                </span>
              </span>
            </ULink>
          </li>
        </ul>
        <p v-else class="text-muted">
          No airline in the collection is a member of {{ alliance.name }}.
        </p>

        <section v-if="ceasedMembers.length">
          <h3 class="text-lg font-bold text-highlighted">Ceased members</h3>
          <p class="mt-1 mb-5 text-muted">
            Airlines that were members of {{ alliance.name }} when they ceased
            operations.
          </p>
          <UTable
            :data="ceasedMembers"
            :columns="ceasedColumns"
            class="rounded-lg border border-default"
          >
            <template #name-cell="{ row }">
              <ULink :to="`/airlines/${row.original.slug}`" :class="linkClass">
                {{ row.original.name }}
              </ULink>
            </template>
          </UTable>
        </section>

        <section v-if="formerMembers.length">
          <h3 class="text-lg font-bold text-highlighted">Former members</h3>
          <p class="mt-1 mb-5 text-muted">
            Airlines that left {{ alliance.name }}, with the years each joined
            and left.
          </p>
          <UTable
            :data="formerMembers"
            :columns="formerColumns"
            class="rounded-lg border border-default"
          >
            <template #name-cell="{ row }">
              <ULink :to="`/airlines/${row.original.slug}`" :class="linkClass">
                {{ row.original.name }}
              </ULink>
            </template>
          </UTable>
        </section>
      </div>
    </UPageSection>
  </div>
</template>

<script setup>
const route = useRoute()
const { airlines } = useAirlines()

const alliance = allianceBySlug(route.params.slug)

if (!alliance) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Alliance not found',
    fatal: true,
  })
}

const members = membersOf(alliance, airlines)
const ceasedMembers = membersOf(alliance, airlines, { defunct: true }).map(
  (airline) => ({
    slug: airline.slug,
    name: airline.name,
    ceased: airline.ceased ?? '—',
  }),
)
const formerMembers = formerMembersOf(alliance, airlines).map(
  ({ airline, since, until }) => ({
    slug: airline.slug,
    name: airline.name,
    since: since ?? '—',
    until,
  }),
)

const ceasedColumns = [
  { accessorKey: 'name', header: 'Airline' },
  { accessorKey: 'ceased', header: 'Ceased' },
]
const formerColumns = [
  { accessorKey: 'name', header: 'Airline' },
  { accessorKey: 'since', header: 'Joined' },
  { accessorKey: 'until', header: 'Left' },
]

// The same count as on the alliance's card, never its own member count
const memberCount = collectionCount(alliance, airlines)

const membersDescription = alliance.defunct
  ? `The airlines in the collection that flew in ${alliance.name}. Affiliates flying under a member’s membership aren’t listed.`
  : `The airlines in the collection that fly in ${alliance.name}, and those that ceased or left. Affiliates flying under a member’s membership aren’t listed.`

const color = alliance.branding?.primary_color

// The mark's white tile, washed with the alliance's color as an airline's
// logo is
const wash = brandWash(alliance)

const sectionUi = {
  container: 'py-12 sm:py-12 lg:py-12 gap-8 sm:gap-8',
  title: 'text-2xl sm:text-2xl lg:text-2xl',
  description: 'mt-2',
}

// The Files section keeps its Download all button on its title's line, at
// the right as a page header does its links, with the description across
// the whole width below; on a phone the button follows the description
const filesUi = {
  ...sectionUi,
  wrapper: 'relative',
  title: `${sectionUi.title} sm:pe-56`,
  footer: 'mt-5 sm:absolute sm:end-0 sm:top-0 sm:mt-0',
  links: 'justify-start',
}

const chipClass =
  'flex items-center gap-1.5 rounded-full bg-accented/70 py-1 ps-2 pe-3 font-semibold text-highlighted dark:bg-elevated'
const linkClass =
  'font-semibold text-highlighted underline decoration-accented underline-offset-4 hover:decoration-current'
const memberClass =
  'flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-primary'

// The CDN only serves files, so it is left out until there is a mark
const usageFeatures = [
  {
    title: 'npm package',
    description:
      'The alliance’s data and marks, typed, for Node and the browser. Look it up by name or slug and get file paths to bundle.',
    icon: 'simple-icons:npm',
  },
  allianceMark(alliance) && {
    title: 'CDN',
    description:
      'Link a file straight from the package on jsDelivr or unpkg, with nothing to install. Pin a release line to keep it stable.',
    icon: 'solar:global-linear',
  },
  {
    title: 'API',
    description:
      'Fetch the data as JSON, or a mark as SVG or PNG, with monochrome marks in the color you pick.',
    icon: 'solar:code-square-linear',
  },
].filter(Boolean)

const breadcrumb = [
  {
    label: 'Alliances',
    to: '/alliances',
    icon: 'solar:users-group-rounded-linear',
  },
  { label: alliance.name },
]

const description = [
  `Icon and brand colors of ${alliance.name} as SVG,`,
  `and the airlines in the collection that fly or flew in it.`,
].join(' ')

useSeoMeta({
  title: alliance.name,
  description,
  ogTitle: `${alliance.name} icon`,
  ogDescription: description,
  twitterTitle: `${alliance.name} icon`,
  twitterDescription: description,
})

// The airline card, with the alliance's mark in place of a logo and no
// codes; the site's own card until the collection has a mark
const mark = allianceMark(alliance)
if (mark) {
  defineOgImage('Airline', {
    name: alliance.name,
    codes: [],
    country: 'Airline alliance',
    logo: allianceAssetUrl(alliance, mark),
    color: brandColor(alliance),
  })
} else {
  defineOgImage('Site', { title: alliance.name, description })
}
</script>
