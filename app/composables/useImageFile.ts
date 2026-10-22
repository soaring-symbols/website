// Reactive state for one uploaded image: an SVG (kept as text) or a raster
// reference such as a PNG, with a preview URL and metadata for either kind.
export function useImageFile() {
  const file = ref<File | null>(null)
  const content = ref<string | null>(null)
  const previewUrl = ref<string | null>(null)
  const bbox = ref<DOMRect | null>(null)
  const natural = ref<{ width: number; height: number } | null>(null)

  const isSvg = computed(
    () =>
      !!file.value &&
      (file.value.type === 'image/svg+xml' ||
        file.value.name.toLowerCase().endsWith('.svg')),
  )

  const parsed = computed(() => {
    if (!content.value || !import.meta.client) return null
    return parseSvg(content.value)
  })

  const metadata = computed(() => {
    if (!file.value) return null
    if (isSvg.value) {
      return parsed.value
        ? getSvgMetadata(parsed.value, file.value.size, bbox.value)
        : null
    }
    return natural.value
      ? getRasterMetadata(
          natural.value.width,
          natural.value.height,
          file.value.size,
        )
      : null
  })

  // True once the file is loaded far enough to be compared
  const ready = computed(() =>
    isSvg.value ? !!content.value : !!natural.value,
  )

  watch(file, async (newFile) => {
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = newFile ? URL.createObjectURL(newFile) : null
    content.value = null
    natural.value = null
    bbox.value = null
    if (!newFile) return

    if (isSvg.value) {
      content.value = await newFile.text()
      bbox.value = parsed.value ? computeSvgBBox(parsed.value) : null
    } else {
      const img = new Image()
      img.src = previewUrl.value!
      await img.decode()
      natural.value = { width: img.naturalWidth, height: img.naturalHeight }
    }
  })

  onBeforeUnmount(() => {
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  })

  return { file, content, previewUrl, isSvg, parsed, metadata, ready }
}
