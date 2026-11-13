<template>
  <!-- The top of an airline's page: who it is, its codes and relations, and
       its brand colors, with its hubs on a globe. One layout for every
       airline; only the data, the marks and the colors change. On a wide
       screen the globe takes a third; narrower, it is left out. -->
  <article class="grid gap-10 xl:grid-cols-3">
    <div class="flex min-w-0 flex-col gap-8 xl:col-span-2">
      <!-- Identity: the logo, then the name with its tagline and a line of
           where it is from, its alliance and its years -->
      <header
        class="grid items-center gap-6 sm:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-10"
      >
        <div
          class="flex aspect-[3/2] items-center justify-center overflow-hidden rounded-xl bg-white p-6"
          :style="{ backgroundImage: logoWash }"
        >
          <img
            :src="assetUrl(airline, 'logo')"
            :alt="`${airline.name} logo`"
            class="size-full object-contain"
          />
        </div>

        <div class="flex min-w-0 flex-col gap-4">
          <div>
            <h1
              class="text-3xl font-extrabold tracking-tight text-highlighted text-balance sm:text-4xl"
            >
              {{ airline.name }}
            </h1>
            <p
              v-if="airline.branding?.tagline"
              class="mt-1.5 text-lg text-muted text-pretty"
            >
              “{{ airline.branding.tagline }}”
            </p>
          </div>

          <ul class="flex flex-wrap items-center gap-2 text-sm">
            <li :class="chipClass">
              <CountryFlags :iso="airline.country" />
              <span class="cap-center">{{ countryName(airline.country) }}</span>
            </li>
            <li v-if="airline.alliance" :class="chipClass">
              <UIcon
                name="solar:users-group-rounded-bold-duotone"
                class="size-4 text-muted"
              />
              <span class="cap-center">{{ airline.alliance }}</span>
            </li>
            <!-- The year it started; a ceased airline's end year is in its
               badge, so this says "Founded" rather than "Since" -->
            <li v-if="airline.founded" :class="chipClass">
              <UIcon
                name="solar:calendar-bold-duotone"
                class="size-4 text-muted"
              />
              <span class="cap-center"
                >{{ airline.defunct ? 'Founded' : 'Since' }}
                {{ airline.founded }}</span
              >
            </li>
            <li v-if="airline.defunct" :class="chipClass">
              <UIcon
                name="solar:forbidden-circle-bold-duotone"
                class="size-4 text-muted"
              />
              <span class="cap-center">{{ ceasedLabel(airline) }}</span>
            </li>
          </ul>

          <a
            v-if="airline.website"
            :href="airline.website"
            target="_blank"
            rel="noopener"
            class="inline-flex w-fit max-w-full items-center gap-1.5 text-sm font-semibold text-highlighted underline decoration-accented underline-offset-4 hover:decoration-current"
          >
            <UIcon name="solar:global-bold-duotone" class="size-4 shrink-0" />
            <span class="cap-center truncate">{{
              cleanUrl(airline.website)
            }}</span>
          </a>

          <!-- One way down to everything it was before: names and codes,
             alliances and logos, in the History section of the page. A
             link styled as a button: UButton's own click handling lets the
             router scroll back to the top after the smooth scroll -->
          <ULink
            v-if="historySummary"
            :to="historyLink"
            class="inline-flex w-fit max-w-full items-center gap-1.5 rounded-md bg-elevated px-2.5 py-1.5 text-sm font-medium text-default transition-colors hover:bg-accented/75 focus-visible:outline-2 focus-visible:outline-primary"
            @click="scrollToHistory"
          >
            <UIcon name="solar:history-bold-duotone" class="size-5 shrink-0" />
            <span class="cap-center truncate">
              History
              <span class="font-normal text-muted">· {{ historySummary }}</span>
            </span>
            <UIcon name="solar:arrow-down-linear" class="size-5 shrink-0" />
          </ULink>
        </div>
      </header>

      <!-- Codes first, a cell each; relations to other airlines take a wider
         cell, since some list a dozen names. No boxes: the icon tiles and
         the spacing set the cells apart. -->
      <dl class="grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-4">
        <div
          v-for="item in facts"
          :key="item.label"
          class="flex min-w-0 items-center gap-3"
          :class="span(item)"
        >
          <span
            class="grid size-11 shrink-0 place-items-center rounded-lg bg-surface text-muted"
          >
            <UIcon :name="item.icon" class="size-6" />
          </span>
          <div class="min-w-0">
            <dt class="text-xs text-muted">{{ item.label }}</dt>
            <dd class="mt-0.5 font-semibold text-highlighted">
              <template v-if="item.links">
                <template v-for="(link, i) in item.links" :key="link.label">
                  <ULink :to="link.to" :class="linkClass">
                    {{ link.label }}
                  </ULink>
                  <span v-if="i < item.links.length - 1" class="text-muted"
                    >,
                  </span>
                </template>
              </template>
              <template v-else>{{ item.value }}</template>
            </dd>
          </div>
        </div>
      </dl>

      <!-- The colors drawn in its logo and icon, each copied on click -->
      <section v-if="colors.length" aria-labelledby="brand-colors">
        <h2 id="brand-colors" class="mb-2.5 text-sm font-semibold text-muted">
          Brand colors
        </h2>
        <ul class="flex flex-wrap gap-2">
          <li v-for="color in shownColors" :key="color">
            <button
              type="button"
              class="group flex cursor-pointer items-center gap-2 rounded-full bg-surface py-1 ps-1 pe-2.5 transition-colors hover:bg-elevated focus-visible:outline-2 focus-visible:outline-primary"
              :aria-label="`Copy ${color.toUpperCase()}`"
              @click="copyColor(color)"
            >
              <span
                class="size-5 rounded-full ring-1 ring-black/10 ring-inset dark:ring-white/25"
                :style="{ backgroundColor: color }"
              />
              <span class="font-mono text-xs font-semibold text-highlighted">
                {{ color.toUpperCase() }}
              </span>
              <UIcon
                name="solar:copy-linear"
                class="size-3.5 text-dimmed transition-colors group-hover:text-highlighted"
                aria-hidden="true"
              />
            </button>
          </li>
          <li v-if="colors.length > COLOR_LIMIT" class="flex items-center">
            <button
              type="button"
              class="cursor-pointer px-2 text-xs font-semibold text-highlighted underline decoration-accented underline-offset-4 hover:decoration-current focus-visible:outline-2 focus-visible:outline-primary"
              :aria-expanded="showAllColors"
              @click="showAllColors = !showAllColors"
            >
              {{ showAllColors ? 'Show less' : `${hiddenCount} more` }}
            </button>
          </li>
        </ul>
      </section>
    </div>

    <!-- Its hubs on the globe, with flights leaving and reaching them:
         only for an airline with a hub to show. Decoration; the hubs are
         listed with the facts. -->
    <HeroGlobe
      v-if="mappedHubs.length"
      :hubs="mappedHubs"
      class="hidden aspect-square w-full self-center xl:block"
    />
  </article>
</template>

<script setup>
import { HUBS } from '~/data/hubs'

const props = defineProps({
  airline: { type: Object, required: true },
})

// The logo's white tile, washed with the airline's color: a faint tint all
// over, strongest in the top left corner, so it reads without a border
// The hubs the globe can place
const mappedHubs = computed(() =>
  (props.airline.hubs ?? []).filter((code) => HUBS[code]),
)

const logoWash = computed(() => {
  const color = brandColor(props.airline)

  return `radial-gradient(circle at 0% 0%, ${color}33, transparent 70%), linear-gradient(${color}0f, ${color}0f)`
})

const {
  historySummary,
  historyLink,
  scrollToHistory,
  related,
  colors,
  shownColors,
  hiddenCount,
  showAllColors,
  copyColor,
  COLOR_LIMIT,
} = useAirlineProfile(() => props.airline)

const chipClass =
  'flex items-center gap-1.5 rounded-full bg-accented/70 py-1 ps-2 pe-3 font-semibold text-highlighted dark:bg-elevated'
const linkClass =
  'text-highlighted underline decoration-accented underline-offset-4 hover:decoration-current'

const RELATION_ICONS = {
  'Part of': 'solar:buildings-bold-duotone',
  Subsidiaries: 'solar:buildings-2-bold-duotone',
  'Former subsidiaries': 'solar:buildings-2-bold-duotone',
  'Succeeded by': 'solar:arrow-right-bold-duotone',
  'Preceded by': 'solar:arrow-left-bold-duotone',
}

// Every cell of the grid: both codes always, a dash for one it lacks, then
// whatever else the airline has: callsign, hubs and relations. What it
// doesn't have is left out rather than shown empty; its history is a button
// in the card above.
const facts = computed(() => {
  const { airline } = props
  const hubs = airline.hubs ?? []

  return [
    {
      label: 'IATA code',
      value: airline.iata ?? '—',
      icon: 'solar:ticket-bold-duotone',
    },
    {
      label: 'ICAO code',
      value: airline.icao ?? '—',
      icon: 'solar:ticket-star-bold-duotone',
    },
    airline.callsign && {
      label: 'Callsign',
      value: airline.callsign,
      icon: 'solar:phone-calling-bold-duotone',
    },
    hubs.length && {
      label: hubs.length > 1 ? 'Hubs' : 'Hub',
      value: hubs.join(', '),
      icon: 'solar:map-point-bold-duotone',
      wide: hubs.length > 4,
    },
    ...related.value.map((row) => ({
      label: row.label,
      icon: RELATION_ICONS[row.label],
      wide: true,
      links: row.airlines.map((other) => ({
        label: other.name,
        to: `/airlines/${other.slug}`,
      })),
    })),
  ].filter(Boolean)
})

// A long list takes two columns, or the whole row past three airlines
function span(item) {
  if (!item.wide) return ''

  return item.links?.length > 3 ? 'col-span-2 md:col-span-4' : 'col-span-2'
}
</script>
