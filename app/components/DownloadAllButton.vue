<template>
  <!-- Every SVG of an airline or an alliance in one zip: its current marks
       and, under history/<year>/, its older ones, laid out as in the
       package, e.g. vietnam-airlines/logo.svg -->
  <UButton
    :label="`Download all ${files.length} files`"
    icon="solar:download-square-linear"
    variant="subtle"
    :loading="busy"
    :disabled="!files.length"
    :ui="{ label: 'block' }"
    @click="download"
  />
</template>

<script setup>
const props = defineProps({
  entry: { type: Object, required: true },
  source: { type: String, default: 'airlines' },
})

const toast = useToast()
const busy = ref(false)

// Each file the entry ships, current set first, then each older one
const files = computed(() => {
  const { types } = MARK_SOURCES[props.source]
  const sets = [undefined, ...markHistory(props.entry)]

  return sets.flatMap((mark) =>
    types
      .flatMap(({ variant }) => [variant, `${variant}-mono`])
      .filter((variant) => hasAsset(props.entry, variant, mark))
      .map((variant) => ({
        url: assetUrl(props.entry, variant, mark, props.source),
        path: assetPath(props.entry, variant, mark),
      })),
  )
})

async function download() {
  busy.value = true

  try {
    // Loaded on the first click: no other page needs it
    const [{ zipSync, strToU8 }, contents] = await Promise.all([
      import('fflate'),
      Promise.all(
        files.value.map(async ({ url }) => {
          const response = await fetch(url)
          if (!response.ok) throw new Error(`${url}: ${response.status}`)
          return response.text()
        }),
      ),
    ])

    const zip = zipSync(
      Object.fromEntries(
        files.value.map(({ path }, i) => [path, strToU8(contents[i])]),
      ),
    )

    const link = document.createElement('a')
    link.href = URL.createObjectURL(
      new Blob([zip], { type: 'application/zip' }),
    )
    link.download = `${props.entry.slug}.zip`
    link.click()
    // Freed after the browser has started the download
    setTimeout(() => URL.revokeObjectURL(link.href), 1000)
  } catch {
    toast.add({
      title: 'Couldn’t download the files',
      description: 'Check your connection and try again.',
      color: 'error',
    })
  } finally {
    busy.value = false
  }
}
</script>
