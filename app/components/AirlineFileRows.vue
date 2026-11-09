<template>
  <!-- One row per mark, its color file beside its monochrome one, so every
       row is full whichever marks the airline has -->
  <div class="flex flex-col gap-3">
    <div
      class="hidden gap-6 text-sm font-semibold text-muted lg:grid lg:grid-cols-[8rem_minmax(0,1fr)_minmax(0,1fr)]"
      aria-hidden="true"
    >
      <span />
      <span>Color</span>
      <span>Monochrome</span>
    </div>

    <div class="flex flex-col gap-10 lg:gap-6">
      <section
        v-for="mark in marks"
        :key="mark.variant"
        class="grid gap-4 sm:grid-cols-2 lg:grid-cols-[8rem_minmax(0,1fr)_minmax(0,1fr)] lg:gap-6"
      >
        <component
          :is="headingTag"
          class="font-bold text-highlighted sm:col-span-2 lg:col-span-1 lg:pt-2"
        >
          {{ mark.label }}
        </component>

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
                :src="assetUrl(airline, file.variant, since)"
                :alt="`${airline.name} ${file.kind} ${mark.label.toLowerCase()}${since ? ` introduced in ${since}` : ''}`"
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
                  {{ fileName(file.variant) }}
                </p>
              </div>
              <div class="flex shrink-0 gap-1">
                <UButton
                  icon="hugeicons:link-04"
                  variant="ghost"
                  :aria-label="`Copy the CDN link to ${fileName(file.variant)}`"
                  @click="copyCdnUrl(file.variant)"
                />
                <UButton
                  :to="assetUrl(airline, file.variant, since)"
                  external
                  :download="downloadName(file.variant)"
                  icon="hugeicons:download-04"
                  variant="outline"
                  :aria-label="`Download ${fileName(file.variant)}`"
                />
              </div>
            </div>
          </div>

          <!-- A missing file, or the whole mark, asks for a contribution -->
          <div
            v-else
            class="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-accented p-6 text-center text-sm text-muted"
            :class="file.kind === 'none' && 'min-h-40 sm:col-span-2'"
          >
            <p>{{ file.missing }}</p>
            <ULink
              :to="CONTRIBUTING_URL"
              target="_blank"
              class="font-semibold text-highlighted underline decoration-accented underline-offset-4 hover:decoration-current"
            >
              Contribute one
            </ULink>
          </div>
        </template>
      </section>
    </div>
  </div>
</template>

<script setup>
// The files of one set of marks: the airline's current ones, or with
// `since` and `assets` the older ones from its history
const props = defineProps({
  airline: { type: Object, required: true },
  since: { type: Number, default: undefined },
  assets: { type: Object, default: undefined },
  // h4 under a heading of its own, such as an older mark's year
  headingTag: { type: String, default: 'h3' },
})

const tint = brandTint(props.airline)
const assets = props.assets ?? props.airline.assets

// Every current mark gets a row, so each airline page lists the same rows
// and asks for what is missing; an older mark lists only the types it had.
// A slot is empty (variant null) when that file is not shipped yet.
const marks = [
  { variant: 'logo', label: 'Logo' },
  { variant: 'icon', label: 'Icon' },
  { variant: 'tail', label: 'Tail' },
]
  .map((mark) => {
    const name = mark.label.toLowerCase()
    const has = (variant) => hasAsset(props.airline, variant, assets)
    const color = has(mark.variant) ? mark.variant : null
    const mono = has(`${mark.variant}-mono`) ? `${mark.variant}-mono` : null

    // With neither file, one placeholder spans the row
    const files =
      color || mono
        ? [
            { kind: 'color', variant: color, missing: `No color ${name} yet.` },
            {
              kind: 'mono',
              variant: mono,
              missing: `No monochrome ${name} yet.`,
            },
          ]
        : [{ kind: 'none', variant: null, missing: `No ${name} yet.` }]

    return { ...mark, files, shipped: Boolean(color || mono) }
  })
  .filter((mark) => props.since === undefined || mark.shipped)

function fileName(variant) {
  return props.since === undefined
    ? `${variant}.svg`
    : `history/${props.since}/${variant}.svg`
}

function downloadName(variant) {
  return (
    [props.airline.slug, props.since, variant].filter(Boolean).join('-') +
    '.svg'
  )
}

const toast = useToast()

async function copyCdnUrl(variant) {
  await navigator.clipboard.writeText(
    `https://cdn.jsdelivr.net/npm/soaring-symbols/dist/assets/${assetDir(props.airline, props.since)}/${variant}.svg`,
  )
  toast.add({ title: 'Copied the CDN link', duration: 1500 })
}
</script>
