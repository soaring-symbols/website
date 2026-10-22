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
        :total="allChecks.length"
        :passed="passedCount"
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
          :total="allChecks.length"
          :passed="passedCount"
        />
      </div>

      <UFileUpload
        v-model="reference.file.value"
        accept=".svg,image/svg+xml,image/png,image/jpeg,image/webp"
        icon="hugeicons:git-compare"
        label="Compare with a reference (optional)"
        description="Drop the original PNG, JPEG or WebP, or the previous SVG, to check that vectorizing, optimizing or merging paths did not change how it looks."
        class="min-h-36"
      />
    </template>
  </div>
</template>

<script setup>
const type = ref('logo')
const candidate = useImageFile()
const reference = useImageFile()

const STRUCTURE_LABELS = [
  'Required attributes',
  'No embedded scripts',
  'No transforms',
]
const GEOMETRY_LABELS = ['Fills viewBox', 'Fits viewBox', 'Centered']

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
  )
})

const groupedChecks = computed(() => {
  const groups = [
    { title: 'Structure', labels: STRUCTURE_LABELS },
    { title: 'Geometry', labels: GEOMETRY_LABELS },
  ]
  return groups
    .map((g) => ({
      title: g.title,
      checks: g.labels
        .map((label) => allChecks.value.find((c) => c.label === label))
        .filter(Boolean),
    }))
    .filter((g) => g.checks.length > 0)
})

const allPass = computed(() => allChecks.value.every((c) => c.pass))
const passedCount = computed(() => allChecks.value.filter((c) => c.pass).length)
</script>
