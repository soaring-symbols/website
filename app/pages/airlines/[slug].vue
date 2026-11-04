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
      <p class="mt-2 max-w-2xl text-toned text-pretty">
        Download a file, or link it straight from the npm package through
        jsDelivr.
      </p>

      <ul class="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <li
          v-for="file in files"
          :key="file.variant"
          class="flex flex-col gap-4 rounded-xl bg-surface p-4"
        >
          <div
            class="flex aspect-[2/1] items-center justify-center overflow-hidden rounded-lg bg-white p-6"
            :style="{ backgroundImage: tint }"
          >
            <img
              :src="assetUrl(airline, file.variant)"
              :alt="`${airline.name} ${file.label.toLowerCase()}`"
              loading="lazy"
              class="size-full object-contain"
            />
          </div>

          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0">
              <h3 class="font-bold text-highlighted">{{ file.label }}</h3>
              <p class="truncate font-mono text-xs text-muted">
                {{ file.variant }}.svg
              </p>
            </div>
            <div class="flex shrink-0 gap-1">
              <UButton
                icon="hugeicons:link-04"
                variant="ghost"
                :aria-label="`Copy the CDN link to the ${file.label.toLowerCase()}`"
                @click="copy(cdnUrl(file.variant), 'CDN link')"
              />
              <UButton
                :to="assetUrl(airline, file.variant)"
                external
                :download="`${airline.slug}-${file.variant}.svg`"
                icon="hugeicons:download-04"
                variant="outline"
                :aria-label="`Download the ${file.label.toLowerCase()}`"
              />
            </div>
          </div>
        </li>
      </ul>
    </section>

    <!-- The same data from the package -->
    <section
      class="mt-16 grid items-start gap-10 border-t border-default pt-12 lg:grid-cols-2"
    >
      <div class="max-w-xl">
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
      ><code><span class="text-flap-ink/50">import</span> { getAirline, getAssets } <span class="text-flap-ink/50">from</span> 'soaring-symbols'

getAirline('{{ lookupCode }}')
getAssets('{{ lookupCode }}').logo.color
<span class="text-flap-ink/50">// '{{ `assets/${airline.slug}/logo.svg` }}'</span></code></pre>
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

const VARIANTS = [
  { variant: 'logo', label: 'Logo' },
  { variant: 'logo-mono', label: 'Monochrome logo' },
  { variant: 'icon', label: 'Icon' },
  { variant: 'icon-mono', label: 'Monochrome icon' },
  { variant: 'tail', label: 'Tail' },
  { variant: 'tail-mono', label: 'Monochrome tail' },
]
const files = VARIANTS.filter((f) => hasAsset(airline, f.variant))

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
