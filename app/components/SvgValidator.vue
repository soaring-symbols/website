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
          :variant="variant"
          :has-file="!!candidate.file.value"
          :airline="airline"
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
        :title="`${possessive(airline)} ${kind} is single-color`"
        :description="`Its ${kind}-mono.svg is generated from ${kind}.svg when the package is built, so a mono file isn't needed. Upload the color ${kind}.svg instead.`"
      />

      <ValidatorFixCard
        v-if="candidate.file.value"
        :state="fixState"
        :options="fixOptions"
        :file-name="fileName"
        :repo-path="repoPath"
        :can-merge="canMerge"
        :needed="needsFix"
        :needs-name="needsName"
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

const candidate = useImageFile()
const reference = useImageFile()
// A fix of the SVG, kept here so it outlives the Check tab's components
const fixState = useSvgFix(candidate)

// What the upload is, guessed from it and open to a pick by hand, which wins
// until the next upload: logo or icon, color or mono, and the airline its
// <title> should name. `…From` says where a guess came from.
const type = useGuess('logo')
const variant = useGuess('color')
const airline = ref(null)

const title = computed(
  () =>
    candidate.parsed.value?.querySelector('title')?.textContent?.trim() ?? '',
)

// Each upload: the type from the file name or viewBox; the variant from the
// name (-mono.svg), else from the drawing; the airline from the title, by its
// current or former name. A fixed file keeps what the fix was run with, and
// its title is the airline picked, which may be one the catalog lacks.
watch(
  () => candidate.parsed.value,
  (svg) => {
    // A file being swapped reads as none for a moment; keep the picks
    if (!svg || fixState.result.value) return
    const name = candidate.file.value?.name ?? ''

    const detected = detectAssetType(svg, name)
    type.set(detected?.type, detected?.source ?? null)

    const namedMono = /-mono\.svg$/i.test(name)
    variant.set(
      namedMono || candidate.isMono.value ? 'mono' : 'color',
      namedMono ? 'file name' : 'colors',
    )

    airline.value = airlineByName(title.value, { former: true })?.name ?? null
    offerColor()
  },
)

// The catalog's entry for the airline picked, if it has one
const knownAirline = computed(() => airlineByName(airline.value))
const isCatalogName = computed(() => !!knownAirline.value)

// logo, icon or tail, and the name the repo expects for this file
// (icon-mono.svg and so on), whatever the upload was called
const kind = computed(() =>
  assetKind(type.value, candidate.file.value?.name ?? ''),
)
const fileName = computed(
  () => `${kind.value}${variant.value === 'mono' ? '-mono' : ''}.svg`,
)
const repoPath = computed(() =>
  airline.value
    ? `assets/${knownAirline.value?.slug ?? airlineSlug(airline.value)}/${fileName.value}`
    : null,
)

// A mono file for a catalog airline whose color asset is single-color: the
// build derives that one, so the color file is what to contribute
const derivedMono = computed(() => {
  if (variant.value !== 'mono' || !candidate.file.value) return false
  const asset = knownAirline.value?.assets?.[kind.value]
  return !!asset?.color && asset.colors.length === 1
})

const allChecks = computed(() => {
  if (!candidate.parsed.value) return []
  return runSvgValidations(
    candidate.parsed.value,
    type.value,
    candidate.bbox.value,
    { mono: variant.value === 'mono', source: candidate.content.value },
  )
})

// What --fix can do about the failing checks, as the package marks them:
// fix them outright (true), or once given an option ('mergePaths',
// 'fillColor'), which the fix card then offers
const failingFixable = (fixable) =>
  allChecks.value.some((c) => !c.pass && c.fixable === fixable)
const needsFix = computed(() =>
  allChecks.value.some((c) => !c.pass && c.fixable !== false),
)
const canMerge = computed(() => failingFixable('mergePaths'))

// A color file with no color of its own, as the package's check finds it:
// one color at most, which the fix draws it in once it is given
const needsColor = computed(() => failingFixable('fillColor'))
// The catalog's color for it: the asset's own when it is single-color,
// else the airline's primary color
const suggestedColor = computed(() => {
  const known = knownAirline.value
  const colors = known?.assets?.[kind.value]?.colors ?? []
  return colors.length === 1
    ? colors[0]
    : (known?.branding?.primary_color ?? null)
})
// Offered on each upload (above) and when the airline or the variant
// changes, but never over a color typed or picked
function offerColor() {
  if (needsColor.value && suggestedColor.value && !fixState.fillColor.value)
    fixState.fillColor.value = suggestedColor.value
}
watch([suggestedColor, needsColor], offerColor)

// What the fix is run with, and what keeps it from running: a missing
// <title> needs the airline's name
const fixOptions = computed(() => ({
  type: kind.value,
  mono: variant.value === 'mono',
  airlineName: airline.value ?? undefined,
  isCatalogName: isCatalogName.value,
}))
const needsName = computed(() => !title.value && !airline.value)

// "Vietnam Airlines'" and "SpiceJet's"
const possessive = (name) => (name.endsWith('s') ? `${name}'` : `${name}'s`)

// The fixed file, next to the one uploaded
function compareWithOriginal(original) {
  reference.file.value = original
  tab.value = 'compare'
}

// Groups in the order the package lists its checks in
const groupedChecks = computed(() => {
  const groups = new Map()
  for (const check of allChecks.value) {
    if (!groups.has(check.group)) groups.set(check.group, [])
    groups.get(check.group).push(check)
  }
  return [...groups].map(([title, checks]) => ({ title, checks }))
})

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
