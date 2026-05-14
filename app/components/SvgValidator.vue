<template>
  <div class="flex flex-col gap-4">
    <!-- Toolbar with file upload -->
    <UFileUpload
      v-slot="{ open }"
      v-model="file"
      accept=".svg,image/svg+xml"
      :preview="false"
    >
      <ValidatorToolbar
        :type="type"
        @update:type="onTypeChange"
        @upload="open()"
      />
    </UFileUpload>

    <!-- Two-column layout when file loaded -->
    <div v-if="file" class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
      <ValidatorPreviewCard
        :preview-url="previewUrl"
        :file-name="file.name"
        :metadata="svgMetadata"
        :all-pass="allPass"
        @remove="resetFile"
      />
      <ValidatorPanel
        :groups="groupedChecks"
        :all-pass="allPass"
        :total="allChecks.length"
        :passed="passedCount"
      />
    </div>
  </div>
</template>

<script setup>
const type = ref('logo')
const file = ref(null)
const svgContent = ref(null)
const svgBBox = ref(null)
const previewUrl = ref(null)

const STRUCTURE_LABELS = [
  'Required attributes',
  'No embedded scripts',
  'No transforms',
]
const GEOMETRY_LABELS = ['Fills viewBox', 'Fits viewBox', 'Centered']

// --- Handlers ---

function onTypeChange(newType) {
  type.value = newType
  resetFile()
}

function resetFile() {
  file.value = null
  svgContent.value = null
  svgBBox.value = null
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
}

// --- Watchers ---

watch(file, (newFile, oldFile) => {
  if (oldFile && previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  if (!newFile) {
    svgContent.value = null
    svgBBox.value = null
    previewUrl.value = null
    return
  }
  previewUrl.value = URL.createObjectURL(newFile)
  const reader = new FileReader()
  reader.onload = (e) => {
    svgContent.value = e.target.result
  }
  reader.readAsText(newFile)
})

watch(svgContent, async () => {
  svgBBox.value = null
  if (!svgContent.value || !import.meta.client) return
  await nextTick()
  if (!parsedSvg.value) return
  svgBBox.value = computeSvgBBox(parsedSvg.value)
})

// --- Computed ---

const parsedSvg = computed(() => {
  if (!svgContent.value || !import.meta.client) return null
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgContent.value, 'image/svg+xml')
  return doc.querySelector('svg')
})

const stylingCheck = computed(() => {
  if (!parsedSvg.value) return null
  const elements = parsedSvg.value.querySelectorAll('*')
  const colors = new Set()
  elements.forEach((el) => {
    const fill = el.getAttribute('fill')
    const stroke = el.getAttribute('stroke')
    if (fill && fill !== 'none' && fill !== 'currentColor')
      colors.add(fill.toLowerCase())
    if (stroke && stroke !== 'none' && stroke !== 'currentColor')
      colors.add(stroke.toLowerCase())
    const style = el.getAttribute('style')
    if (style) {
      const fillMatch = style.match(/fill\s*:\s*([^;]+)/)
      const strokeMatch = style.match(/stroke\s*:\s*([^;]+)/)
      if (fillMatch && fillMatch[1].trim() !== 'none')
        colors.add(fillMatch[1].trim().toLowerCase())
      if (strokeMatch && strokeMatch[1].trim() !== 'none')
        colors.add(strokeMatch[1].trim().toLowerCase())
    }
  })
  const count = colors.size || 1
  const limit = type.value === 'icon' ? 3 : 8
  return {
    label: 'Consistent styling',
    pass: count <= limit,
    detail: `${count} color${count !== 1 ? 's' : ''} used`,
  }
})

const allChecks = computed(() => {
  if (!parsedSvg.value) return []
  const base = runSvgValidations(parsedSvg.value, type.value, svgBBox.value)
  return stylingCheck.value ? [...base, stylingCheck.value] : base
})

const groupedChecks = computed(() => {
  const groups = [
    { title: 'Structure', labels: STRUCTURE_LABELS },
    { title: 'Geometry', labels: GEOMETRY_LABELS },
    { title: 'Styling', labels: ['Consistent styling'] },
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

const svgMetadata = computed(() => {
  if (!parsedSvg.value || !file.value) return null
  const svg = parsedSvg.value
  const viewBox = svg.getAttribute('viewBox') ?? 'missing'
  const paths = svg.querySelectorAll('path').length
  const elements = svg.querySelectorAll('*')
  const colors = new Set()
  elements.forEach((el) => {
    const fill = el.getAttribute('fill')
    const stroke = el.getAttribute('stroke')
    if (fill && fill !== 'none' && fill !== 'currentColor')
      colors.add(fill.toLowerCase())
    if (stroke && stroke !== 'none' && stroke !== 'currentColor')
      colors.add(stroke.toLowerCase())
  })

  const bbox = svgBBox.value
  const r = (n) => Math.round(n * 1000) / 1000
  const dimensions = bbox
    ? `${r(bbox.width)} × ${r(bbox.height)}`
    : viewBox !== 'missing'
      ? viewBox.split(' ').slice(2).join(' × ')
      : '—'

  const bytes = file.value.size
  const fileSize =
    bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`

  return { dimensions, paths, colors: colors.size || 0, fileSize, viewBox }
})
</script>
