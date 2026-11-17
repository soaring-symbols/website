<template>
  <!-- One row per mark of an airline or an alliance: its color file, its
       monochrome one and the one for dark backgrounds, side by side, so every
       row is full whichever marks it has -->
  <div class="flex flex-col gap-3">
    <div
      class="hidden gap-6 text-sm font-semibold text-muted lg:grid lg:grid-cols-[8rem_repeat(3,minmax(0,1fr))]"
      aria-hidden="true"
    >
      <span />
      <span>Color</span>
      <span>Monochrome</span>
      <span>Dark background</span>
    </div>

    <div class="flex flex-col gap-10 lg:gap-6">
      <section
        v-for="row in rows"
        :key="row.variant"
        class="grid gap-4 sm:grid-cols-3 lg:grid-cols-[8rem_repeat(3,minmax(0,1fr))] lg:gap-6"
      >
        <component
          :is="mark ? 'h4' : 'h3'"
          class="font-bold text-highlighted sm:col-span-3 lg:col-span-1 lg:pt-2"
        >
          {{ row.label }}
        </component>

        <template v-for="file in row.files" :key="file.kind">
          <div
            v-if="file.variant"
            class="flex flex-col gap-4 rounded-xl bg-surface p-4"
          >
            <!-- The dark file on a dark ground in either theme, the others
                 on the light ground they are drawn for. A logo is a wide
                 name in a square viewBox, so its tile is taller than an
                 icon's to let the name read -->
            <div
              class="flex items-center justify-center overflow-hidden rounded-lg p-6"
              :class="[
                file.kind === 'dark' ? 'bg-tile-dark' : 'bg-tile',
                row.variant === 'logo' ? 'aspect-[4/3]' : 'aspect-[5/2]',
              ]"
              :style="{ backgroundImage: tint }"
            >
              <img
                :src="assetUrl(entry, file.variant, mark, source)"
                :alt="`${entry.name} ${file.kind} ${row.label.toLowerCase()}${mark ? ` introduced in ${mark.since}` : ''}`"
                loading="lazy"
                class="size-full object-contain"
              />
            </div>

            <div class="flex items-center justify-between gap-3">
              <div class="min-w-0">
                <p class="font-semibold text-highlighted lg:sr-only">
                  {{ KIND_LABELS[file.kind] }}
                </p>
                <p class="truncate font-mono text-xs text-muted">
                  {{ fileName(file.variant) }}
                </p>
              </div>
              <div class="flex shrink-0 gap-1">
                <UButton
                  icon="solar:link-linear"
                  variant="ghost"
                  :aria-label="`Copy the CDN link to ${fileName(file.variant)}`"
                  @click="copyCdnUrl(file.variant)"
                />
                <UButton
                  :to="assetUrl(entry, file.variant, mark, source)"
                  external
                  :download="downloadName(entry, file.variant, mark)"
                  icon="solar:download-linear"
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
            :class="file.kind === 'none' && 'min-h-40 sm:col-span-3'"
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
// The files of one set of marks of an airline or, with `source`
// 'alliances', an alliance: its current ones, or with `mark` (an entry of
// markHistory()) an older set, headed by its year
const props = defineProps({
  entry: { type: Object, required: true },
  source: { type: String, default: 'airlines' },
  mark: { type: Object, default: undefined },
})

const tint = brandTint(props.entry)

const KIND_LABELS = {
  color: 'Color',
  mono: 'Monochrome',
  dark: 'Dark background',
}
const { types, asked } = MARK_SOURCES[props.source]

// The mark types the source asks for always get a row, so each page lists
// the same rows and asks for what is missing; the others, and every type of
// an older set, only when there is a file. A slot is empty (variant null)
// when that file is not shipped yet.
const rows = types.flatMap(({ variant, label }) => {
  const name = label.toLowerCase()
  const has = (v) => hasAsset(props.entry, v, props.mark)
  const color = has(variant) ? variant : null
  const mono = has(`${variant}-mono`) ? `${variant}-mono` : null
  const dark = has(`${variant}-dark`) ? `${variant}-dark` : null

  if (!color && !mono) {
    // With neither file, one placeholder spans the row
    return props.mark || !asked.includes(variant)
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
        {
          kind: 'dark',
          variant: dark,
          // The package makes one from a monochrome file
          missing: `No ${name} for dark backgrounds yet: it needs a monochrome ${name}.`,
        },
      ],
    },
  ]
})

// The path under the entry's folder, e.g. 'history/1984/logo.svg'
function fileName(variant) {
  return assetPath(props.entry, variant, props.mark).slice(
    props.entry.slug.length + 1,
  )
}

const toast = useToast()

async function copyCdnUrl(variant) {
  await navigator.clipboard.writeText(
    cdnUrl(props.entry, variant, props.mark, props.source),
  )
  toast.add({ title: 'Copied the CDN link', duration: 1500 })
}
</script>
