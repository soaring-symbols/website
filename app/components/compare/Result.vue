<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="hugeicons:git-compare" class="size-4 text-muted" />
        <span class="font-medium text-sm">Comparison</span>
      </div>
    </template>

    <div class="flex flex-col gap-4">
      <UAlert v-if="loading" icon="hugeicons:loading-03" title="Comparing…" />
      <UAlert
        v-else-if="error"
        color="error"
        icon="hugeicons:cancel-circle"
        title="Could not render one of the SVGs"
        :description="error"
      />
      <UAlert
        v-else-if="result"
        :color="verdict.color"
        :icon="verdict.icon"
        :title="verdict.title"
        :description="verdict.description"
      />

      <div
        v-if="result && !loading"
        class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start"
      >
        <!-- Difference map -->
        <div class="flex flex-col gap-2">
          <canvas
            ref="maskCanvas"
            class="w-full max-w-80 aspect-square mx-auto border border-default rounded-md"
          />
          <div
            class="flex items-center justify-center gap-4 text-xs text-muted"
          >
            <span class="flex items-center gap-1.5">
              <span
                class="size-3 rounded-sm"
                :style="{ background: rgb(colors.diff) }"
              />
              Differs
            </span>
            <span class="flex items-center gap-1.5">
              <span
                class="size-3 rounded-sm"
                :style="{ background: rgb(colors.shape) }"
              />
              Same
            </span>
          </div>
        </div>

        <!-- Stats -->
        <table class="w-full text-sm">
          <thead>
            <tr class="text-muted text-left border-b border-default">
              <th class="py-2 font-normal" />
              <th class="py-2 font-normal">Before</th>
              <th class="py-2 font-normal">After</th>
              <th class="py-2 font-normal">Change</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in statRows"
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
      </div>
    </div>
  </UCard>
</template>

<script setup>
const props = defineProps({
  before: { type: Object, required: true },
  after: { type: Object, required: true },
})

const colorMode = useColorMode()
const loading = ref(false)
const error = ref(null)
const result = ref(null)
const maskCanvas = ref(null)

const colors = computed(() =>
  colorMode.value === 'dark'
    ? { diff: [251, 113, 133], shape: [63, 63, 70] }
    : { diff: [225, 29, 72], shape: [212, 212, 216] },
)

const rgb = ([r, g, b]) => `rgb(${r} ${g} ${b})`

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
}

const verdict = computed(() => VERDICTS[result.value?.verdict] ?? {})

const percent = (share) =>
  share === 0
    ? '0%'
    : share < 0.0001
      ? '<0.01%'
      : `${(share * 100).toFixed(2)}%`

const statRows = computed(() => {
  const b = props.before
  const a = props.after
  const bytesB = b.file.value?.size ?? 0
  const bytesA = a.file.value?.size ?? 0
  const delta = (x, y) =>
    y - x === 0 ? '—' : `${y - x > 0 ? '+' : ''}${y - x}`
  const sizeChange = bytesB
    ? `${bytesA - bytesB > 0 ? '+' : ''}${(((bytesA - bytesB) / bytesB) * 100).toFixed(1)}%`
    : '—'

  return [
    {
      label: 'File size',
      before: b.metadata.value?.fileSize,
      after: a.metadata.value?.fileSize,
      change: sizeChange,
      changeClass:
        bytesA < bytesB
          ? 'text-success'
          : bytesA > bytesB
            ? 'text-warning'
            : '',
    },
    {
      label: 'Paths',
      before: b.metadata.value?.paths,
      after: a.metadata.value?.paths,
      change: delta(b.metadata.value?.paths, a.metadata.value?.paths),
    },
    {
      label: 'Colors',
      before: b.metadata.value?.colors,
      after: a.metadata.value?.colors,
      change: delta(b.metadata.value?.colors, a.metadata.value?.colors),
    },
    {
      label: 'viewBox',
      before: b.metadata.value?.viewBox,
      after: a.metadata.value?.viewBox,
      change:
        b.metadata.value?.viewBox === a.metadata.value?.viewBox
          ? '—'
          : 'changed',
      changeClass:
        b.metadata.value?.viewBox === a.metadata.value?.viewBox
          ? ''
          : 'text-warning',
    },
    ...(result.value?.renders ?? []).map((r) => ({
      label: `Diff @ ${r.size}px`,
      before: '',
      after: '',
      change: `${r.diffPixels} px (${percent(r.share)})`,
    })),
  ]
})

async function run() {
  const before = props.before.content.value
  const after = props.after.content.value
  if (!before || !after) return
  loading.value = true
  error.value = null
  try {
    result.value = await compareSvgs(before, after, colors.value)
  } catch (e) {
    result.value = null
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

function drawMask() {
  const canvas = maskCanvas.value
  const mask = result.value?.mask
  if (!canvas || !mask) return
  canvas.width = mask.width
  canvas.height = mask.height
  canvas.getContext('2d').putImageData(mask, 0, 0)
}

watch(
  [() => props.before.content.value, () => props.after.content.value, colors],
  run,
  { immediate: true },
)
watch([result, maskCanvas], drawMask, { flush: 'post' })
</script>
