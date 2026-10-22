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
        @update:type="onTypeChange"
        @upload="open()"
      />
    </UFileUpload>

    <template v-if="candidate.file.value">
      <!-- The SVG and its guideline checks -->
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

      <!-- Optional comparison with the original artwork -->
      <div class="flex flex-col gap-1 pt-2">
        <h2 class="font-semibold">Compare with a reference</h2>
        <p class="text-sm text-muted">
          Optional: add the original PNG, JPEG or WebP, or the previous SVG, to
          check that vectorizing, optimizing or merging paths did not change how
          it looks.
        </p>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <CompareSide label="Reference" :image="reference" />
        <CompareResult
          v-if="reference.ready.value && candidate.ready.value"
          :reference="reference"
          :candidate="candidate"
        />
      </div>
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

// The expected viewBox depends on the type, so start over with a new file
function onTypeChange(newType) {
  type.value = newType
  candidate.file.value = null
}

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
