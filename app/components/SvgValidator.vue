<template>
  <div class="flex flex-col gap-6">
    <!-- Two jobs, one per tab: check one SVG, or compare it with the original.
         The SVG is shared, so it carries over from one tab to the other. -->
    <UTabs
      v-model="tab"
      :items="tabs"
      :content="false"
      variant="link"
      class="w-full"
    />

    <!-- Check: the SVG against the contribution guidelines -->
    <template v-if="tab === 'check'">
      <!-- A drop target only: a click inside opens the file picker solely
           through the toolbar's button, not from the pickers around it -->
      <UFileUpload
        v-slot="{ open }"
        v-model="candidate.file.value"
        accept=".svg,image/svg+xml"
        :preview="false"
        :interactive="false"
      >
        <ValidatorToolbar
          :type="type"
          :detected-from="detectedFrom"
          :has-file="!!candidate.file.value"
          :airline="airline"
          :variant="variant"
          :variant-from="variantFrom"
          @update:type="onTypeChange"
          @update:variant="onVariantChange"
          @update:airline="airline = $event"
          @upload="open()"
        />
      </UFileUpload>

      <!-- A single-color asset's mono file is made by the build -->
      <UAlert
        v-if="derivedMono"
        color="warning"
        variant="subtle"
        icon="hugeicons:alert-02"
        :title="`${possessive(airline)} ${derivedMono} is single-color`"
        :description="`Its ${derivedMono}-mono.svg is generated from ${derivedMono}.svg when the package is built, so a mono file isn't needed. Upload the color ${derivedMono}.svg instead.`"
      />

      <ValidatorFixCard
        v-if="candidate.file.value"
        :state="fixState"
        :type="type"
        :file-name="checkName"
        :airline-name="airline"
        :is-catalog-name="isCatalogName"
        :can-merge="canMerge"
        :needed="needsFix"
        :has-title="hasTitle"
        :needs-color="needsColor"
        @compare="compareWithOriginal"
      />

      <div
        v-if="candidate.file.value"
        class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start"
      >
        <ValidatorPreviewCard
          :preview-url="candidate.previewUrl.value"
          :file-name="candidate.file.value.name"
          :metadata="candidate.metadata.value"
          :mono="candidate.isMono.value"
          @remove="candidate.file.value = null"
        />
        <ValidatorPanel
          :groups="groupedChecks"
          :file-name="candidate.file.value.name"
        />
      </div>
      <UFileUpload
        v-else
        v-model="candidate.file.value"
        accept=".svg,image/svg+xml"
        icon="hugeicons:upload-04"
        label="Drop an SVG here"
        description="A logo, icon or tail, color or -mono. It never leaves your browser."
        class="min-h-72"
      />
    </template>

    <!-- Compare: the SVG with the original artwork or its previous version -->
    <template v-else>
      <p class="text-sm text-muted">
        Add the original artwork (PNG, JPEG or WebP) or the previous SVG under
        Original, and your SVG under Your SVG, to check the artwork still looks
        the same.
      </p>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CompareSide
          label="Original"
          :image="reference"
          accept=".svg,image/svg+xml,image/png,image/jpeg,image/webp"
          drop-label="Drop the original here"
          description="PNG, JPEG or WebP artwork, or the previous SVG"
        />
        <CompareSide
          label="Your SVG"
          color="primary"
          :image="candidate"
          accept=".svg,image/svg+xml"
          drop-label="Drop your SVG here"
          description="The SVG you are contributing"
        >
          <!-- The guideline result, so it isn't lost on this tab -->
          <UButton
            v-if="candidate.parsed.value"
            :label="checkSummary.label"
            :icon="checkSummary.icon"
            :color="checkSummary.color"
            variant="soft"
            size="xs"
            trailing-icon="hugeicons:arrow-right-01"
            @click="tab = 'check'"
          />
        </CompareSide>
      </div>

      <CompareResult
        v-if="reference.ready.value && candidate.ready.value"
        :reference="reference"
        :candidate="candidate"
      />
    </template>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()

const tabs = [
  { label: 'Check', value: 'check', icon: 'hugeicons:checkmark-circle-02' },
  { label: 'Compare', value: 'compare', icon: 'hugeicons:git-compare' },
]

// Kept in the URL (?tab=compare), so a link can open either tab
const tab = computed({
  get: () => (route.query.tab === 'compare' ? 'compare' : 'check'),
  set: (value) =>
    router.replace({
      query: { ...route.query, tab: value === 'check' ? undefined : value },
    }),
})

const type = ref('logo')
const candidate = useImageFile()
const reference = useImageFile()
// A fix of the SVG, kept here so it outlives the Check tab's components
const fixState = useSvgFix(candidate)

const detectedFrom = ref(null)

// Picking a type by hand overrides the detected one and re-runs the checks
function onTypeChange(newType) {
  type.value = newType
  detectedFrom.value = null
}

// Pick the type from each new upload; keep the current one if it can't tell
watch(
  () => candidate.parsed.value,
  (svg) => {
    detectedFrom.value = null
    if (!svg) return
    const detected = detectAssetType(svg, candidate.file.value?.name ?? '')
    if (!detected) return
    type.value = detected.type
    detectedFrom.value = detected.source
  },
)

// Color or mono: from the file name (-mono.svg), else from the drawing
// (currentColor and no color of its own). A pick by hand wins until the next
// upload; a fixed file keeps what the fix was run with.
const variant = ref('color')
const variantFrom = ref(null)
function onVariantChange(value) {
  variant.value = value
  variantFrom.value = null
}
watch(
  () => candidate.parsed.value,
  (svg) => {
    if (!svg || fixState.result.value) return
    const name = candidate.file.value?.name ?? ''
    if (/-mono\.svg$/i.test(name)) {
      variant.value = 'mono'
      variantFrom.value = 'file name'
    } else {
      variant.value = candidate.isMono.value ? 'mono' : 'color'
      variantFrom.value = 'colors'
    }
  },
)

// The name the checks and the fix go by, and the download gets: logo.svg,
// icon-mono.svg and so on, whatever the upload was called
const checkName = computed(() =>
  assetFileName(
    type.value,
    candidate.file.value?.name ?? '',
    variant.value === 'mono',
  ),
)

// The airline <title> should name, guessed from the current title when the
// catalog knows it (by its name or a former one)
const { airlines } = useAirlines()
const airline = ref(null)
watch(
  () => candidate.parsed.value,
  (svg) => {
    // A file being swapped reads as none for a moment; keep the pick
    if (!svg) return
    const title = svg.querySelector('title')?.textContent?.trim()
    const match = airlines.find(
      (a) => a.name === title || a.previous_names?.includes(title),
    )
    // A fixed file's title is the name picked, which may be a new airline
    airline.value =
      match?.name ?? (title && title === airline.value ? title : null)
  },
)
const hasTitle = computed(
  () => !!candidate.parsed.value?.querySelector('title')?.textContent?.trim(),
)
const isCatalogName = computed(() =>
  airlines.some((a) => a.name === airline.value),
)

// A mono file for a catalog airline whose color asset is single-color: the
// build derives that one, so the color file is what to contribute. Gives the
// asset's type ('logo', 'icon', 'tail'), or null.
const derivedMono = computed(() => {
  if (variant.value !== 'mono' || !candidate.file.value) return null
  const kind = checkName.value.replace(/-mono\.svg$/, '')
  const asset = airlines.find((a) => a.name === airline.value)?.assets?.[kind]
  return asset?.color && asset.colors.length === 1 ? kind : null
})

// A color file with no color of its own (currentColor, or default black):
// one color at most, which the fix draws it in once it is given
const needsColor = computed(
  () =>
    variant.value === 'color' &&
    !!candidate.parsed.value &&
    getSvgColors(candidate.parsed.value).size === 0,
)
// The catalog's color for it: the asset's own when it is single-color,
// else the airline's primary color
const suggestedColor = computed(() => {
  const known = airlines.find((a) => a.name === airline.value)
  if (!known) return null
  const kind = checkName.value.replace(/(-mono)?\.svg$/, '')
  const colors = known.assets?.[kind]?.colors ?? []
  return colors.length === 1
    ? colors[0]
    : (known.branding?.primary_color ?? null)
})

// Offer that color for each new upload, and when the airline or the variant
// changes, but never over one typed or picked
function offerColor() {
  if (needsColor.value && suggestedColor.value && !fixState.fillColor.value)
    fixState.fillColor.value = suggestedColor.value
}
watch(() => candidate.parsed.value, offerColor, { flush: 'post' })
watch([suggestedColor, needsColor], offerColor)

// "Vietnam Airlines'" and "SpiceJet's"
const possessive = (name) => (name.endsWith('s') ? `${name}'` : `${name}'s`)

// The fixed file, next to the one uploaded
function compareWithOriginal(original) {
  reference.file.value = original
  tab.value = 'compare'
}

const allChecks = computed(() => {
  if (!candidate.parsed.value) return []
  return runSvgValidations(
    candidate.parsed.value,
    type.value,
    candidate.bbox.value,
    {
      fileName: checkName.value,
      source: candidate.content.value,
    },
  )
})

// Groups in the order the package lists its checks in
const groupedChecks = computed(() => {
  const groups = new Map()
  for (const check of allChecks.value) {
    if (!groups.has(check.group)) groups.set(check.group, [])
    groups.get(check.group).push(check)
  }
  return [...groups].map(([title, checks]) => ({ title, checks }))
})

// Anything failing, warnings included, may be something --fix clears
const needsFix = computed(() => allChecks.value.some((c) => !c.pass))
const canMerge = computed(() =>
  allChecks.value.some((c) => c.label === 'One path per color' && !c.pass),
)

// Warnings never fail an SVG, as on the Check tab
const checkSummary = computed(() => {
  const issues = allChecks.value.filter((c) => !c.pass && !isWarning(c)).length
  return issues
    ? {
        label: `${issues} guideline issue${issues > 1 ? 's' : ''}`,
        icon: 'hugeicons:cancel-circle',
        color: 'error',
      }
    : {
        label: 'Meets the guidelines',
        icon: 'hugeicons:checkmark-circle-02',
        color: 'success',
      }
})
</script>
