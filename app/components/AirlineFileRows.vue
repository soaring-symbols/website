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
        v-for="row in rows"
        :key="row.variant"
        class="grid gap-4 sm:grid-cols-2 lg:grid-cols-[8rem_minmax(0,1fr)_minmax(0,1fr)] lg:gap-6"
      >
        <component
          :is="mark ? 'h4' : 'h3'"
          class="font-bold text-highlighted sm:col-span-2 lg:col-span-1 lg:pt-2"
        >
          {{ row.label }}
        </component>

        <template v-for="file in row.files" :key="file.kind">
          <div
            v-if="file.variant"
            class="flex flex-col gap-4 rounded-xl bg-surface p-4"
          >
            <div
              class="flex aspect-[5/2] items-center justify-center overflow-hidden rounded-lg bg-white p-6"
              :style="{ backgroundImage: tint }"
            >
              <img
                :src="assetUrl(airline, file.variant, mark)"
                :alt="`${airline.name} ${file.kind} ${row.label.toLowerCase()}${mark ? ` introduced in ${mark.since}` : ''}`"
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
                  :to="assetUrl(airline, file.variant, mark)"
                  external
                  :download="downloadName(airline, file.variant, mark)"
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
// The files of one set of marks: the airline's current ones, or with `mark`
// (an entry of markHistory()) an older set, headed by its year
const props = defineProps({
  airline: { type: Object, required: true },
  mark: { type: Object, default: undefined },
})

const tint = brandTint(props.airline)

// Every current mark type gets a row, so each airline page lists the same
// rows and asks for what is missing; an older set lists only the types it
// had. A slot is empty (variant null) when that file is not shipped yet.
const rows = MARK_TYPES.flatMap(({ variant, label }) => {
  const name = label.toLowerCase()
  const has = (v) => hasAsset(props.airline, v, props.mark)
  const color = has(variant) ? variant : null
  const mono = has(`${variant}-mono`) ? `${variant}-mono` : null

  if (!color && !mono) {
    // With neither file, one placeholder spans the row
    return props.mark
      ? []
      : [
          {
            variant,
            label,
            files: [
              { kind: 'none', variant: null, missing: `No ${name} yet.` },
            ],
          },
        ]
  }

  return [
    {
      variant,
      label,
      files: [
        { kind: 'color', variant: color, missing: `No color ${name} yet.` },
        { kind: 'mono', variant: mono, missing: `No monochrome ${name} yet.` },
      ],
    },
  ]
})

// The path under the airline's folder, e.g. 'history/1984/logo.svg'
function fileName(variant) {
  return assetPath(props.airline, variant, props.mark).slice(
    props.airline.slug.length + 1,
  )
}

const toast = useToast()

async function copyCdnUrl(variant) {
  await navigator.clipboard.writeText(
    cdnUrl(props.airline, variant, props.mark),
  )
  toast.add({ title: 'Copied the CDN link', duration: 1500 })
}
</script>
