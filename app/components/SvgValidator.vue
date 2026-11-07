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
      <ValidatorPanel :groups="groupedChecks" />
    </template>

    <!-- Validating only: the SVG next to its checks, and a reference dropzone -->
    <template v-else-if="candidate.file.value">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <ValidatorPreviewCard
          :preview-url="candidate.previewUrl.value"
          :file-name="candidate.file.value.name"
          :metadata="candidate.metadata.value"
          :all-pass="allPass"
          :mono="isMono"
          @remove="candidate.file.value = null"
        />
        <ValidatorPanel :groups="groupedChecks" />
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

// Drawn only in currentColor, with no colors of its own
const isMono = computed(
  () =>
    !!candidate.parsed.value &&
    /currentColor/i.test(candidate.content.value ?? '') &&
    getSvgColors(candidate.parsed.value).size === 0,
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

// Groups in the order the package lists its checks in
const groupedChecks = computed(() => {
  const groups = new Map()
  for (const check of allChecks.value) {
    if (!groups.has(check.group)) groups.set(check.group, [])
    groups.get(check.group).push(check)
  }
  return [...groups].map(([title, checks]) => ({ title, checks }))
})

const allPass = computed(() =>
  allChecks.value.every((c) => c.pass || isWarning(c)),
)
</script>
