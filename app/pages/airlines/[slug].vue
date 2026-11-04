<template>
  <div class="pt-6 pb-16 sm:pt-10">
    <UBreadcrumb :items="breadcrumb" class="mb-6" />

    <AirlineSpotlight :airline="airline" heading-tag="h1" :page-link="false" />

    <!-- Every SVG the airline ships, with where to get it -->
    <section class="mt-16 border-t border-default pt-12">
      <h2
        class="text-2xl font-extrabold tracking-tight text-highlighted text-balance"
      >
        Files
      </h2>
      <p class="mt-2 text-toned text-pretty">
        Download a file, or link it straight from the npm package through
        jsDelivr. Monochrome files use currentColor, so they take the color of
        the text around them.
      </p>

      <!-- One row per mark, its color file beside its monochrome one, so
           every row is full whichever marks the airline has -->
      <div
        class="mt-8 hidden gap-6 text-sm font-semibold text-muted lg:grid lg:grid-cols-[8rem_minmax(0,1fr)_minmax(0,1fr)]"
        aria-hidden="true"
      >
        <span />
        <span>Color</span>
        <span>Monochrome</span>
      </div>

      <div class="mt-8 flex flex-col gap-10 lg:mt-3 lg:gap-6">
        <section
          v-for="mark in marks"
          :key="mark.variant"
          class="grid gap-4 sm:grid-cols-2 lg:grid-cols-[8rem_minmax(0,1fr)_minmax(0,1fr)] lg:gap-6"
        >
          <h3
            class="font-bold text-highlighted sm:col-span-2 lg:col-span-1 lg:pt-2"
          >
            {{ mark.label }}
          </h3>

          <template v-for="file in mark.files" :key="file.kind">
            <div
              v-if="file.variant"
              class="flex flex-col gap-4 rounded-xl bg-surface p-4"
            >
              <div
                class="flex aspect-[5/2] items-center justify-center overflow-hidden rounded-lg bg-white p-6"
                :style="{ backgroundImage: tint }"
              >
                <img
                  :src="assetUrl(airline, file.variant)"
                  :alt="`${airline.name} ${file.kind} ${mark.label.toLowerCase()}`"
                  loading="lazy"
                  class="size-full object-contain"
                />
              </div>

              <div class="flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <p class="font-semibold text-highlighted lg:sr-only">
                    {{ file.kind === 'mono' ? 'Monochrome' : 'Color' }}
                  </p>
                  <p class="truncate font-mono text-xs text-muted">
                    {{ file.variant }}.svg
                  </p>
                  <p v-if="file.derived" class="mt-1 text-xs text-muted">
                    Made here from the color file, not in the package
                  </p>
                </div>
                <div class="flex shrink-0 gap-1">
                  <UButton
                    v-if="!file.derived"
                    icon="hugeicons:link-04"
                    variant="ghost"
                    :aria-label="`Copy the CDN link to ${file.variant}.svg`"
                    @click="copy(cdnUrl(file.variant), 'CDN link')"
                  />
                  <UButton
                    :to="assetUrl(airline, file.variant)"
                    external
                    :download="`${airline.slug}-${file.variant}.svg`"
                    icon="hugeicons:download-04"
                    variant="outline"
                    :aria-label="`Download ${file.variant}.svg`"
                  />
                </div>
              </div>
            </div>

            <!-- Multi-color marks need a hand-drawn mono version -->
            <div
              v-else
              class="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-accented p-6 text-center text-sm text-muted"
            >
              <p>No monochrome {{ mark.label.toLowerCase() }} yet.</p>
              <ULink
                to="https://github.com/soaring-symbols/soaring-symbols/blob/main/CONTRIBUTING.md"
                target="_blank"
                class="font-semibold text-highlighted underline decoration-accented underline-offset-4 hover:decoration-current"
              >
                Contribute one
              </ULink>
            </div>
          </template>
        </section>
      </div>
    </section>

    <!-- The same data from the package -->
    <section
      class="mt-16 grid items-start gap-10 border-t border-default pt-12 lg:grid-cols-2"
    >
      <div>
        <h2
          class="text-2xl font-extrabold tracking-tight text-highlighted text-balance"
        >
          In your project
        </h2>
        <p class="mt-2 text-toned text-pretty">
          Look {{ airline.name }} up in the npm package by its IATA code, ICAO
          code or name.
        </p>
        <UButton
          to="/#use"
          label="Install the package"
          trailing-icon="hugeicons:arrow-right-02"
          variant="outline"
          class="mt-6"
          :ui="{ label: 'block' }"
        />
      </div>

      <pre
        class="overflow-x-auto rounded-xl bg-board p-5 font-mono text-[0.8125rem] leading-relaxed text-flap-ink"
      ><code><span class="text-flap-ink/50">import</span> { getAirline, getAssetPath } <span class="text-flap-ink/50">from</span> 'soaring-symbols'

getAirline('{{ lookupCode }}')
getAssetPath('{{ lookupCode }}', '{{ snippetVariant }}')
<span class="text-flap-ink/50">// {{ snippetPath }}</span></code></pre>
    </section>
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

const tint = brandTint(airline)
const lookupCode = airline.iata || airline.icao

const breadcrumb = [
  { label: 'Browse', to: '/browse', icon: 'hugeicons:airplane-01' },
  { label: airline.name },
]

// Each mark the airline has, with its color file and its monochrome one;
// the mono slot stays empty (variant null) when neither exists
const marks = [
  { variant: 'logo', label: 'Logo' },
  { variant: 'icon', label: 'Icon' },
  { variant: 'tail', label: 'Tail' },
]
  .filter((mark) => hasAsset(airline, mark.variant))
  .map((mark) => {
    const mono = `${mark.variant}-mono`

    return {
      ...mark,
      files: [
        { kind: 'color', variant: mark.variant, derived: false },
        {
          kind: 'mono',
          variant: hasAsset(airline, mono) ? mono : null,
          derived: isDerivedAsset(airline, mono),
        },
      ],
    }
  })

// The package snippet shows the first color file the airline ships
const snippetVariant = marks[0]?.variant ?? 'logo'
const snippetPath = marks.length
  ? `'soaring-symbols/assets/${airline.slug}/${snippetVariant}.svg'`
  : 'undefined'

function cdnUrl(variant) {
  return `https://cdn.jsdelivr.net/npm/soaring-symbols/dist/assets/${airline.slug}/${variant}.svg`
}

const toast = useToast()

async function copy(text, what) {
  await navigator.clipboard.writeText(text)
  toast.add({ title: `Copied the ${what}`, duration: 1500 })
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
