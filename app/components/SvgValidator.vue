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
      <UFileUpload
        v-slot="{ open }"
        v-model="candidate.file.value"
        accept=".svg,image/svg+xml"
        :preview="false"
      >
        <ValidatorToolbar
          :type="type"
          :detected-from="detectedFrom"
          :has-file="!!candidate.file.value"
          @update:type="onTypeChange"
          @upload="open()"
        />
      </UFileUpload>

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

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <CompareSide
          label="Original"
          :image="reference"
          accept=".svg,image/svg+xml,image/png,image/jpeg,image/webp"
          description="PNG, JPEG or WebP artwork, or the previous SVG"
        />
        <CompareSide
          label="Your SVG"
          color="primary"
          :image="candidate"
          accept=".svg,image/svg+xml"
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
