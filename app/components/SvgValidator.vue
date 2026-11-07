<template>
  <div class="flex flex-col gap-4">
    <!-- Toolbar with file upload -->
    <UFileUpload
      v-slot="{ open }"
      v-model="candidate.file.value"
      accept=".svg,image/svg+xml"
      :preview="false"
    >
      <ValidatorToolbar
        :type="type"
        :detected-from="detectedFrom"
        @update:type="onTypeChange"
        @upload="open()"
      />
    </UFileUpload>

    <!-- Comparing: both previews, the comparison, then the guideline checks -->
    <template v-if="candidate.file.value && reference.file.value">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <CompareSide label="Reference" :image="reference" />
        <CompareSide label="SVG" color="primary" :image="candidate" />
      </div>
      <CompareResult
        v-if="reference.ready.value && candidate.ready.value"
        :reference="reference"
        :candidate="candidate"
      />
      <ValidatorPanel
        :groups="groupedChecks"
        :all-pass="allPass"
        :total="errorChecks.length"
        :passed="passedCount"
        :warnings="warningCount"
      />
    </template>

    <!-- Validating only: the SVG next to its checks, and a reference dropzone -->
    <template v-else-if="candidate.file.value">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <ValidatorPreviewCard
          :preview-url="candidate.previewUrl.value"
          :file-name="candidate.file.value.name"
          :metadata="candidate.metadata.value"
          :all-pass="allPass"
          @remove="candidate.file.value = null"
        />
        <ValidatorPanel
          :groups="groupedChecks"
          :all-pass="allPass"
          :total="errorChecks.length"
          :passed="passedCount"
          :warnings="warningCount"
        />
      </div>

      <UFileUpload
        v-model="reference.file.value"
        accept=".svg,image/svg+xml,image/png,image/jpeg,image/webp"
        icon="hugeicons:git-compare"
        label="Compare with a reference"
        description="Optional. Drop the original PNG, JPEG or WebP, or the previous SVG, to check the artwork still looks the same."
        class="min-h-36"
      />
    </template>
  </div>
</template>

<script setup>
const type = ref('logo')
const candidate = useImageFile()
const reference = useImageFile()

// Same order as the package lists its checks in
const GROUPS = ['Structure', 'Format', 'Style', 'Geometry']

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

const allChecks = computed(() => {
  if (!candidate.parsed.value) return []
  return runSvgValidations(
    candidate.parsed.value,
    type.value,
    candidate.bbox.value,
    {
      fileName: candidate.file.value?.name ?? '',
      source: candidate.content.value,
    },
  )
})

const groupedChecks = computed(() =>
  GROUPS.map((title) => ({
    title,
    checks: allChecks.value.filter((c) => c.group === title),
  })).filter((g) => g.checks.length > 0),
)

// Warnings are advice, as in `lint-svg.js --check`: they never fail an SVG
const errorChecks = computed(() =>
  allChecks.value.filter((c) => c.level !== 'warning'),
)
const allPass = computed(() => errorChecks.value.every((c) => c.pass))
const passedCount = computed(
  () => errorChecks.value.filter((c) => c.pass).length,
)
const warningCount = computed(
  () => allChecks.value.filter((c) => c.level === 'warning' && !c.pass).length,
)
</script>
