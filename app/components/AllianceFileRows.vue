<template>
  <!-- One row per mark, the icon first, its color file beside its
       monochrome one, as on an airline's page -->
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
        <h3
          class="font-bold text-highlighted sm:col-span-2 lg:col-span-1 lg:pt-2"
        >
          {{ row.label }}
        </h3>

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
                :src="allianceAssetUrl(alliance, file.variant)"
                :alt="`${alliance.name} ${file.kind} ${row.label.toLowerCase()}`"
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
              </div>
              <div class="flex shrink-0 gap-1">
                <UButton
                  icon="solar:link-linear"
                  variant="ghost"
                  :aria-label="`Copy the CDN link to ${file.variant}.svg`"
                  @click="copyCdnUrl(file.variant)"
                />
                <UButton
                  :to="allianceAssetUrl(alliance, file.variant)"
                  external
                  :download="`${alliance.slug}-${file.variant}.svg`"
                  icon="solar:download-linear"
                  variant="outline"
                  :aria-label="`Download ${file.variant}.svg`"
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
const props = defineProps({
  alliance: { type: Object, required: true },
})

const tint = brandTint(props.alliance)

// The icon always gets a row, asking for it when missing. The logo only
// does once the alliance has one: alliances rarely show a logo with their
// name, so its absence isn't a gap to fill.
const rows = ALLIANCE_MARK_TYPES.flatMap(({ variant, label }) => {
  const name = label.toLowerCase()
  const has = (v) => hasAllianceAsset(props.alliance, v)
  const color = has(variant) ? variant : null
  const mono = has(`${variant}-mono`) ? `${variant}-mono` : null

  if (!color && !mono) {
    return variant === 'icon'
      ? [
          {
            variant,
            label,
            files: [
              { kind: 'none', variant: null, missing: `No ${name} yet.` },
            ],
          },
        ]
      : []
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

const toast = useToast()

async function copyCdnUrl(variant) {
  await navigator.clipboard.writeText(allianceCdnUrl(props.alliance, variant))
  toast.add({ title: 'Copied the CDN link', duration: 1500 })
}
</script>
