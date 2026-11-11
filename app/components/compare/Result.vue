<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="hugeicons:git-compare" class="size-4 text-muted" />
        <span class="font-medium text-sm">Result</span>
      </div>
    </template>

    <div class="flex flex-col gap-4">
      <UAlert v-if="loading" icon="hugeicons:loading-03" title="Comparing…" />
      <UAlert
        v-else-if="error"
        color="error"
        icon="hugeicons:cancel-circle"
        title="Could not compare the files"
        :description="error"
      />
      <template v-else-if="result">
        <UAlert
          :color="verdict.color"
          :icon="verdict.icon"
          :title="verdict.title"
          :description="verdict.description"
        />
        <p v-if="result.mode === 'outline'" class="text-xs text-muted">
          A raster file can't be compared pixel by pixel, so both images have
          their background removed, are trimmed to their content and scaled to
          the same box. Differences within {{ EDGE_TOLERANCE }}px of the other
          outline are ignored as edge noise.
        </p>
      </template>

      <div
        v-show="result && !loading"
        class="grid grid-cols-1 gap-6 items-start"
        :class="{ 'lg:grid-cols-2': showVisuals }"
      >
        <!-- Difference map / overlay, left out when there is nothing to see -->
        <div v-show="showVisuals" class="flex flex-col items-center gap-3">
          <ViewToggle
            v-model="view"
            label="Comparison view"
            :options="[
              {
                value: 'diff',
                label: 'Difference',
                icon: 'hugeicons:image-composition',
              },
              {
                value: 'overlay',
                label: 'Overlay',
                icon: 'hugeicons:layers-01',
              },
            ]"
          />

          <canvas
            v-show="view === 'diff'"
            ref="maskCanvas"
            class="w-full max-w-80 aspect-square border border-default rounded-md"
          />
          <div
            v-show="view === 'overlay'"
            class="relative w-full max-w-80 aspect-square border border-default rounded-md overflow-hidden"
            :style="checkerboardStyle"
          >
            <canvas ref="beforeCanvas" class="absolute inset-0 size-full" />
            <canvas
              ref="afterCanvas"
              class="absolute inset-0 size-full"
              :style="{ opacity: afterOpacity / 100 }"
            />
          </div>

          <div
            v-if="view === 'diff'"
            class="flex flex-wrap items-center justify-center gap-4 text-xs text-muted"
          >
            <span
              v-for="item in legend"
              :key="item.label"
              class="flex items-center gap-1.5"
            >
              <span
                class="size-3 rounded-sm"
                :style="{ background: rgb(item.color) }"
              />
              {{ item.label }}
            </span>
          </div>
          <div v-else class="flex items-center gap-3 w-full max-w-80 text-xs">
            <span class="text-muted shrink-0">{{ ORIGINAL }}</span>
            <USlider v-model="afterOpacity" :min="0" :max="100" />
            <span class="text-muted shrink-0">{{ YOURS }}</span>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <!-- What changed between the two files -->
          <table class="w-full text-xs sm:text-sm">
            <thead>
              <tr class="text-muted text-left border-b border-default">
                <th class="py-2 font-normal" />
                <th class="py-2 font-normal">{{ ORIGINAL }}</th>
                <th class="py-2 font-normal">{{ YOURS }}</th>
                <th class="py-2 font-normal">Change</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in fileRows"
                :key="row.label"
                class="border-b border-default last:border-0"
              >
                <td class="py-2 text-muted">{{ row.label }}</td>
                <td class="py-2 font-mono">{{ row.before }}</td>
                <td class="py-2 font-mono">{{ row.after }}</td>
                <td class="py-2 font-mono" :class="row.changeClass">
                  {{ row.change }}
                </td>
              </tr>
            </tbody>
          </table>

          <!-- How the drawings differ -->
          <table class="w-full text-xs sm:text-sm">
            <tbody>
              <tr
                v-for="row in resultRows"
                :key="row.label"
                class="border-b border-default last:border-0"
              >
                <td class="py-2 text-muted">{{ row.label }}</td>
                <td class="py-2 font-mono text-right" :class="row.changeClass">
                  {{ row.value }}
                </td>
              </tr>
            </tbody>
          </table>

          <UButton
            v-if="!showVisuals && result"
            label="Show the difference map anyway"
            icon="hugeicons:image-composition"
            variant="link"
            color="neutral"
            size="sm"
            class="self-start px-0"
            :ui="{ label: 'block' }"
            @click="showMap = true"
          />
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup>
const props = defineProps({
  // The original artwork (PNG or a previous SVG) and the SVG being validated
  reference: { type: Object, required: true },
  candidate: { type: Object, required: true },
})

// Keep in sync with EDGE_TOLERANCE in utils/svg-compare.ts
const EDGE_TOLERANCE = 2

// The names the compare tab gives each side
const ORIGINAL = 'Original'
const YOURS = 'Your SVG'

const colorMode = useColorMode()
const loading = ref(false)
const error = ref(null)
const result = ref(null)
const view = ref('diff')
// An identical result has no map worth showing, unless asked for
const showMap = ref(false)
const showVisuals = computed(
  () => showMap.value || result.value?.verdict !== 'identical',
)
const afterOpacity = ref(50)
const maskCanvas = ref(null)
const beforeCanvas = ref(null)
const afterCanvas = ref(null)

const colors = computed(() =>
  colorMode.value === 'dark'
    ? { diff: [251, 113, 133], extra: [96, 165, 250], shape: [63, 63, 70] }
    : { diff: [225, 29, 72], extra: [37, 99, 235], shape: [212, 212, 216] },
)

const checkerboardStyle = computed(() => {
  const dark = colorMode.value === 'dark'
  const checker = dark ? '#374151' : '#e5e7eb'
  return {
    backgroundImage: `linear-gradient(45deg, ${checker} 25%, transparent 25%), linear-gradient(135deg, ${checker} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${checker} 75%), linear-gradient(135deg, transparent 75%, ${checker} 75%)`,
    backgroundSize: '16px 16px',
    backgroundPosition: '0 0, 8px 0, 8px -8px, 0 8px',
    backgroundColor: dark ? '#1f2937' : '#ffffff',
  }
})

const rgb = ([r, g, b]) => `rgb(${r} ${g} ${b})`

const legend = computed(() =>
  result.value?.mode === 'outline'
    ? [
        {
          label: `Only in ${ORIGINAL.toLowerCase()}`,
          color: colors.value.diff,
        },
        { label: `Only in ${YOURS}`, color: colors.value.extra },
        { label: 'Both', color: colors.value.shape },
      ]
    : [
        { label: 'Differs', color: colors.value.diff },
        { label: 'Same', color: colors.value.shape },
      ],
)

const VERDICTS = {
  identical: {
    color: 'success',
    icon: 'hugeicons:checkmark-circle-02',
    title: 'Identical',
    description: 'Both SVGs render the same pixels.',
  },
  edges: {
    color: 'info',
    icon: 'hugeicons:information-circle',
    title: 'Edge differences only',
    description:
      'Only anti-aliased edge pixels differ, which happens when paths are merged or re-optimized. The shapes are the same.',
  },
  shapes: {
    color: 'warning',
    icon: 'hugeicons:alert-02',
    title: 'Shapes differ',
    description:
      'The SVGs render differently. Check the highlighted areas in the difference map.',
  },
  match: {
    color: 'success',
    icon: 'hugeicons:checkmark-circle-02',
    title: 'Outlines match',
    description: 'The shapes line up with each other once aligned.',
  },
  close: {
    color: 'info',
    icon: 'hugeicons:information-circle',
    title: 'Close match',
    description:
      'Most of the outline lines up, but some small areas differ. Check the highlighted areas.',
  },
  differs: {
    color: 'warning',
    icon: 'hugeicons:alert-02',
    title: 'Outlines differ',
    description:
      'Parts of the shape are missing or added. Check the highlighted areas, or use the overlay.',
  },
}

// Average color distance above which colors are called out separately
const COLOR_WARNING = 0.1

// A monochrome side is compared on its shapes alone, so say so rather than
// call two differently colored files identical
const SHAPE_ONLY_VERDICTS = {
  identical: {
    title: 'Same shapes',
    description: 'Both SVGs draw the same shapes.',
  },
  edges: {
    title: 'Same shapes, edge differences only',
    description:
      'Only anti-aliased edge pixels differ, which happens when paths are merged or re-optimized.',
  },
  shapes: {
    title: 'Shapes differ',
    description:
      'The SVGs draw different shapes. Check the highlighted areas in the difference map.',
  },
}

const verdict = computed(() => {
  const base = VERDICTS[result.value?.verdict] ?? {}
  if (result.value?.shapeOnly) {
    const shapeOnly = SHAPE_ONLY_VERDICTS[result.value.verdict]
    return {
      ...base,
      ...shapeOnly,
      description: `${shapeOnly.description} One of them is monochrome (currentColor), so their colors aren't compared.`,
    }
  }
  if (result.value?.mode !== 'outline') return base
  if (result.value.colorDelta <= COLOR_WARNING) return base

  return {
    ...base,
    description: `${base.description} The colors also differ noticeably (${percent(result.value.colorDelta)} on average).`,
  }
})

const percent = (share) =>
  share === 0
    ? '0%'
    : share < 0.0001
      ? '<0.01%'
      : `${(share * 100).toFixed(2)}%`

const delta = (x, y) =>
  typeof x !== 'number' || typeof y !== 'number'
    ? '—'
    : y - x === 0
      ? '—'
      : `${y - x > 0 ? '+' : ''}${y - x}`

// Side by side, with the change; a bigger file or fewer colors is no fault in
// itself (a -mono.svg has none), so only a changed viewBox or aspect is flagged
const fileRows = computed(() => {
  const b = props.reference.metadata.value ?? {}
  const a = props.candidate.metadata.value ?? {}
  const bytesB = props.reference.file.value?.size ?? 0
  const bytesA = props.candidate.file.value?.size ?? 0
  const sizeChange =
    bytesB && bytesA !== bytesB
      ? `${bytesA - bytesB > 0 ? '+' : ''}${(((bytesA - bytesB) / bytesB) * 100).toFixed(1)}%`
      : '—'
  const sameViewBox =
    b.viewBox === a.viewBox || [b, a].some((m) => m.viewBox === '—')

  const rows = [
    {
      label: 'File size',
      before: b.fileSize,
      after: a.fileSize,
      change: sizeChange,
    },
    {
      label: 'Paths',
      before: b.paths,
      after: a.paths,
      change: delta(b.paths, a.paths),
    },
    {
      label: 'Colors',
      before: b.colors,
      after: a.colors,
      change: delta(b.colors, a.colors),
    },
    {
      label: 'viewBox',
      before: b.viewBox,
      after: a.viewBox,
      change: sameViewBox ? '—' : 'changed',
      changeClass: sameViewBox ? '' : 'text-warning',
    },
  ]

  const r = result.value
  if (r?.mode === 'outline') {
    const [aspectB, aspectA] = r.aspects
    const aspectChange = (aspectA - aspectB) / aspectB
    rows.push({
      label: 'Aspect ratio',
      before: aspectB.toFixed(3),
      after: aspectA.toFixed(3),
      change:
        Math.abs(aspectChange) < 0.005
          ? '—'
          : `${aspectChange > 0 ? '+' : ''}${(aspectChange * 100).toFixed(1)}%`,
      changeClass: Math.abs(aspectChange) >= 0.02 ? 'text-warning' : '',
    })
  }

  return rows
})

// How far the drawings differ, one measurement per row
const resultRows = computed(() => {
  const r = result.value
  if (!r) return []
  if (r.mode === 'pixel') {
    return r.renders.map((render) => ({
      label: `Pixels that differ at ${render.size}px`,
      value: `${render.diffPixels.toLocaleString()} (${percent(render.share)})`,
    }))
  }

  return [
    { label: 'Outline match', value: percent(r.match) },
    {
      label: `Only in the ${ORIGINAL.toLowerCase()}`,
      value: percent(r.onlyBefore),
    },
    { label: `Only in ${YOURS}`, value: percent(r.onlyAfter) },
    {
      label: 'Color difference',
      value: percent(r.colorDelta),
      changeClass: r.colorDelta > COLOR_WARNING ? 'text-warning' : '',
    },
  ]
})

const toSource = (image) =>
  image.isSvg.value
    ? { kind: 'svg', content: image.content.value }
    : { kind: 'raster', url: image.previewUrl.value }

async function run() {
  if (!props.reference.ready.value || !props.candidate.ready.value) return
  loading.value = true
  error.value = null
  showMap.value = false
  try {
    result.value =
      props.reference.isSvg.value && props.candidate.isSvg.value
        ? await compareSvgs(
            props.reference.content.value,
            props.candidate.content.value,
            colors.value,
          )
        : await compareOutlines(
            toSource(props.reference),
            toSource(props.candidate),
            colors.value,
          )
  } catch (e) {
    result.value = null
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

function paint(canvas, image) {
  if (!canvas || !image) return
  canvas.width = image.width
  canvas.height = image.height
  canvas.getContext('2d').putImageData(image, 0, 0)
}

function draw() {
  paint(maskCanvas.value, result.value?.mask)
  paint(beforeCanvas.value, result.value?.layers[0])
  paint(afterCanvas.value, result.value?.layers[1])
}

watch(
  [
    () => props.reference.previewUrl.value,
    () => props.candidate.previewUrl.value,
    () => props.reference.ready.value && props.candidate.ready.value,
    colors,
  ],
  run,
  { immediate: true },
)
watch([result, maskCanvas, beforeCanvas, afterCanvas], draw, {
  flush: 'post',
})
</script>
