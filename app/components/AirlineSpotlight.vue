<template>
  <!-- Stacks in narrow places like the slideover; spreads into three
       columns of steady height when there is room, as under the board -->
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
          <!-- A steady spotlight keeps room for a two-line name and a tagline
               under the pair, so the tagline still sits right below the name -->
          <div class="min-w-0" :class="steady && 'min-h-[5.75rem]'">
            <component
              :is="headingTag"
              class="text-2xl font-extrabold tracking-tight text-highlighted text-balance"
              :class="steady && 'line-clamp-2'"
            >
              {{ airline.name }}
            </component>
            <div class="mt-1 flex items-center gap-2 empty:hidden">
              <CeasedBadge :airline="airline" />
              <p
                v-if="airline.branding?.tagline"
                class="min-w-0 text-muted"
                :class="steady && 'line-clamp-1'"
              >
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
          <!-- Callsign and years, then hubs below country and alliance;
               left out of a steady spotlight, which keeps one height
               for every airline. Both cells always show, so the pairs
               below stay side by side. -->
          <template v-if="!steady">
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
          </template>
          <div>
            <dt class="text-muted">Country</dt>
            <dd
              class="flex items-center gap-1.5 font-semibold text-highlighted"
            >
              <CountryFlags :iso="airline.country" />
              <span class="min-w-0" :class="steady && 'truncate'">
                {{ countryName(airline.country) }}
              </span>
            </dd>
          </div>
          <div>
            <dt class="text-muted">Alliance</dt>
            <dd
              class="font-semibold text-highlighted"
              :class="steady && 'truncate'"
            >
              {{ airline.alliance ?? 'None' }}
            </dd>
          </div>
          <div v-if="!steady && airline.hubs?.length" class="col-span-2">
            <dt class="text-muted">
              {{ airline.hubs.length > 1 ? 'Hubs' : 'Hub' }}
            </dt>
            <dd class="font-semibold text-highlighted">
              {{ airline.hubs.join(', ') }}
            </dd>
          </div>
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

        <ULink
          v-if="pageLink"
          :to="`/airlines/${airline.slug}`"
          class="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-highlighted underline decoration-accented underline-offset-4 hover:decoration-current"
        >
          All files
          <UIcon name="hugeicons:arrow-right-02" class="size-4" />
        </ULink>
      </div>

      <div class="flex flex-col gap-5">
        <div v-if="steady || colors.length" class="flex flex-col gap-2">
          <p class="text-sm text-muted">Brand colors</p>
          <ul
            :class="
              steady
                ? 'grid grid-cols-2 grid-rows-[repeat(3,1.75rem)] gap-2'
                : 'flex flex-wrap gap-2'
            "
          >
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
                  name="hugeicons:copy-01"
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

        <div class="flex flex-col gap-2">
          <p class="text-sm text-muted">Download SVG</p>
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="download in downloads"
              :key="download.variant"
              :to="assetUrl(airline, download.variant)"
              external
              :download="`${airline.slug}-${download.variant}.svg`"
              :label="download.label"
              :aria-label="`Download ${download.label.toLowerCase()}`"
              icon="hugeicons:download-04"
              :variant="download.variant === 'logo' ? 'solid' : 'outline'"
              :class="download.variant === 'logo' ? 'btn-signal' : undefined"
              :ui="{ label: 'block' }"
            />
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
const props = defineProps({
  airline: { type: Object, required: true },
  headingTag: { type: String, default: 'h2' },
  // Off on the airline's own page, which this would link back to
  pageLink: { type: Boolean, default: true },
  // Keeps the same height for every airline, for places that swap airlines
  // on their own like the home page, so the page below does not jump
  steady: { type: Boolean, default: false },
})

const toast = useToast()

// A faint wash of the airline's own color behind its marks
const tint = computed(() => brandTint(props.airline))

const colors = computed(() => {
  const { logo, icon } = props.airline.assets
  return [...new Set([...(logo?.colors ?? []), ...(icon?.colors ?? [])])]
})

// Gradient-heavy logos list dozens of stops; show a handful until asked.
// A steady spotlight fills three rows of two, the last one left for "more".
const COLOR_LIMIT = computed(() => (props.steady ? 5 : 6))
const showAllColors = ref(false)
watch(
  () => props.airline.slug,
  () => (showAllColors.value = false),
)
const shownColors = computed(() =>
  showAllColors.value ? colors.value : colors.value.slice(0, COLOR_LIMIT.value),
)
const hiddenCount = computed(
  () => colors.value.length - shownColors.value.length,
)

const downloads = computed(() =>
  [
    { variant: 'logo', label: 'Logo' },
    { variant: 'icon', label: 'Icon' },
    { variant: 'tail', label: 'Tail' },
  ].filter((d) => hasAsset(props.airline, d.variant)),
)

async function copy(color) {
  await navigator.clipboard.writeText(color)
  toast.add({ title: `Copied ${color.toUpperCase()}`, duration: 1500 })
}
</script>
