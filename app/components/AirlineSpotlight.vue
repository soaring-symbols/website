<template>
  <!-- Stacks in narrow places like the slideover; spreads into three
       columns when there is room -->
  <article class="@container">
    <div
      class="grid gap-5 @4xl:grid-cols-[16rem_minmax(0,1fr)_17rem] @4xl:gap-8"
    >
      <div
        class="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-white p-6"
        :style="{ backgroundImage: tint }"
      >
        <img
          :src="assetUrl(airline, 'logo')"
          :alt="`${airline.name} logo`"
          class="size-full object-contain"
        />
      </div>

      <div class="flex flex-col gap-5">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <component
              :is="headingTag"
              class="text-2xl font-extrabold tracking-tight text-highlighted text-balance"
            >
              {{ airline.name }}
            </component>
            <div class="mt-1 flex items-center gap-2 empty:hidden">
              <CeasedBadge :airline="airline" />
              <p v-if="airline.branding?.tagline" class="min-w-0 text-muted">
                “{{ airline.branding.tagline }}”
              </p>
            </div>
          </div>
          <div
            v-if="hasAsset(airline, 'icon')"
            class="grid size-16 shrink-0 place-items-center rounded-lg bg-white p-3"
            :style="{ backgroundImage: tint }"
          >
            <img
              :src="assetUrl(airline, 'icon')"
              :alt="`${airline.name} icon`"
              class="size-full object-contain"
            />
          </div>
        </div>

        <dl class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt class="text-muted">IATA code</dt>
            <dd class="font-semibold text-highlighted">{{ airline.iata }}</dd>
          </div>
          <div>
            <dt class="text-muted">ICAO code</dt>
            <dd class="font-semibold text-highlighted">{{ airline.icao }}</dd>
          </div>
          <!-- Callsign and years, then hubs below country and alliance.
               Both cells always show, so the pairs below stay side by
               side. -->
          <div>
            <dt class="text-muted">Callsign</dt>
            <dd class="font-semibold text-highlighted">
              {{ airline.callsign ?? '—' }}
            </dd>
          </div>
          <div>
            <dt class="text-muted">
              {{ airline.ceased ? 'Operated' : 'Founded' }}
            </dt>
            <dd class="font-semibold text-highlighted">
              {{ operatingYears(airline) ?? '—' }}
            </dd>
          </div>
          <div>
            <dt class="text-muted">Country</dt>
            <dd
              class="flex items-center gap-1.5 font-semibold text-highlighted"
            >
              <CountryFlags :iso="airline.country" />
              <span class="min-w-0">
                {{ countryName(airline.country) }}
              </span>
            </dd>
          </div>
          <div>
            <dt class="text-muted">Alliance</dt>
            <dd class="font-semibold text-highlighted">
              {{ airline.alliance ?? 'None' }}
            </dd>
          </div>
          <div v-if="airline.hubs?.length" class="col-span-2">
            <dt class="text-muted">
              {{ airline.hubs.length > 1 ? 'Hubs' : 'Hub' }}
            </dt>
            <dd class="font-semibold text-highlighted">
              {{ airline.hubs.join(', ') }}
            </dd>
          </div>
          <!-- The group it belongs to, the airlines it owns, and the
               airlines it was renamed or merged into or carried on -->
          <template v-if="hasFormer || related.length">
            <!-- The names it flew under before, with a link to the table of
                 every former name and code on its page -->
            <div v-if="hasFormer" class="col-span-2">
              <dt class="text-muted">Formerly</dt>
              <dd class="font-semibold">
                <span v-if="formerNames.length" class="text-highlighted">
                  {{ formerNames.join(', ') }}
                </span>
                <span v-if="formerNames.length" class="text-muted"> · </span>
                <ULink
                  :to="`/airlines/${airline.slug}#former`"
                  :class="linkClass"
                >
                  {{ formerNames.length ? 'Names and codes' : 'Earlier codes' }}
                </ULink>
              </dd>
            </div>
            <div v-for="row in related" :key="row.label" class="col-span-2">
              <dt class="text-muted">{{ row.label }}</dt>
              <dd class="font-semibold">
                <template v-for="(other, i) in row.airlines" :key="other.slug">
                  <ULink :to="`/airlines/${other.slug}`" :class="linkClass">
                    {{ other.name }}
                  </ULink>
                  <span v-if="i < row.airlines.length - 1" class="text-muted"
                    >,
                  </span>
                </template>
              </dd>
            </div>
          </template>
          <div v-if="airline.website" class="col-span-2">
            <dt class="text-muted">Website</dt>
            <dd class="truncate font-semibold">
              <a
                :href="airline.website"
                target="_blank"
                rel="noopener"
                class="text-highlighted underline decoration-accented underline-offset-4 hover:decoration-current"
              >
                {{ cleanUrl(airline.website) }}
              </a>
            </dd>
          </div>
        </dl>
      </div>

      <div class="flex flex-col gap-5">
        <div v-if="colors.length" class="flex flex-col gap-2">
          <p class="text-sm text-muted">Brand colors</p>
          <ul class="flex flex-wrap gap-2">
            <li v-for="color in shownColors" :key="color">
              <button
                type="button"
                class="group flex cursor-pointer items-center gap-2 rounded-full bg-elevated py-1 ps-1 pe-2.5 text-xs font-semibold text-highlighted hover:bg-accented focus-visible:outline-2 focus-visible:outline-primary"
                :title="`Copy ${color.toUpperCase()}`"
                @click="copy(color)"
              >
                <span
                  class="size-5 rounded-full ring-1 ring-black/10 ring-inset dark:ring-white/25"
                  :style="{ backgroundColor: color }"
                />
                {{ color.toUpperCase() }}
                <UIcon
                  name="solar:copy-linear"
                  class="size-3.5 text-dimmed group-hover:text-highlighted"
                  aria-hidden="true"
                />
              </button>
            </li>
            <li v-if="hiddenCount">
              <button
                type="button"
                class="cursor-pointer rounded-full py-1 px-3 text-xs font-semibold text-highlighted underline decoration-accented underline-offset-4 hover:decoration-current focus-visible:outline-2 focus-visible:outline-primary"
                @click="showAllColors = true"
              >
                {{ hiddenCount }} more
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
const props = defineProps({
  airline: { type: Object, required: true },
  headingTag: { type: String, default: 'h2' },
})

const toast = useToast()

// A faint wash of the airline's own color behind its marks
const tint = computed(() => brandTint(props.airline))

const hasFormer = computed(() => formerIdentities(props.airline).length > 0)
const formerNames = computed(() => previousNames(props.airline))

// Links to other airlines, one row per relation it has
const related = computed(() => {
  const parent = airlineBySlug(props.airline.parent)
  const successor = successorOf(props.airline)
  const predecessors = predecessorsOf(props.airline)

  return [
    { label: 'Part of', airlines: parent ? [parent] : [] },
    { label: 'Subsidiaries', airlines: subsidiariesOf(props.airline) },
    {
      label: 'Former subsidiaries',
      airlines: subsidiariesOf(props.airline, { defunct: true }),
    },
    { label: 'Succeeded by', airlines: successor ? [successor] : [] },
    { label: 'Preceded by', airlines: predecessors },
  ].filter((row) => row.airlines.length)
})
const linkClass =
  'text-highlighted underline decoration-accented underline-offset-4 hover:decoration-current'

const colors = computed(() => {
  const { logo, icon } = props.airline.assets
  return [...new Set([...(logo?.colors ?? []), ...(icon?.colors ?? [])])]
})

// Gradient-heavy logos list dozens of stops; show a handful until asked
const COLOR_LIMIT = 6
const showAllColors = ref(false)
watch(
  () => props.airline.slug,
  () => (showAllColors.value = false),
)
const shownColors = computed(() =>
  showAllColors.value ? colors.value : colors.value.slice(0, COLOR_LIMIT),
)
const hiddenCount = computed(
  () => colors.value.length - shownColors.value.length,
)

async function copy(color) {
  await navigator.clipboard.writeText(color)
  toast.add({ title: `Copied ${color.toUpperCase()}`, duration: 1500 })
}
</script>
