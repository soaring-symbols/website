// Reactive state for one uploaded SVG: its text, a preview URL and metadata.
export function useSvgFile() {
  const file = ref<File | null>(null)
  const content = ref<string | null>(null)
  const previewUrl = ref<string | null>(null)
  const bbox = ref<DOMRect | null>(null)

  const parsed = computed(() => {
    if (!content.value || !import.meta.client) return null
    return parseSvg(content.value)
  })

  const metadata = computed(() => {
    if (!parsed.value || !file.value) return null
    return getSvgMetadata(parsed.value, file.value.size, bbox.value)
  })

  watch(file, async (newFile) => {
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = newFile ? URL.createObjectURL(newFile) : null
    content.value = newFile ? await newFile.text() : null
    bbox.value = parsed.value ? computeSvgBBox(parsed.value) : null
  })

  onBeforeUnmount(() => {
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  })

  return { file, content, previewUrl, parsed, metadata }
}
