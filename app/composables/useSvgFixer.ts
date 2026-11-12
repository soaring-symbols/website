import type * as SvgFixer from 'soaring-symbols/svg-fixer'

let loading: Promise<typeof SvgFixer> | null = null

// `lint-svg.js --fix` in the browser. It bundles SVGO and needs resvg's
// WebAssembly (a few MB together), so both load on the first fix only.
export function loadSvgFixer() {
  loading ??= Promise.all([
    import('soaring-symbols/svg-fixer'),
    import('@resvg/resvg-wasm/index_bg.wasm?url'),
  ])
    .then(async ([fixer, { default: wasmUrl }]) => {
      await fixer.initSvgFixer(fetch(wasmUrl))
      return fixer
    })
    .catch((error) => {
      loading = null
      throw error
    })

  return loading
}

interface ImageFile {
  file: Ref<File | null>
  content: Ref<string | null>
}

// A fix of the uploaded SVG: kept by the page rather than the card showing
// it, so it survives a visit to the Compare tab. A fix replaces the image's
// file with the fixed one; undo puts the upload back.
export function useSvgFix(image: ImageFile) {
  const fixing = ref(false)
  const error = ref<string | null>(null)
  const mergePaths = ref(false)
  // The file as uploaded, and what the fix did
  const original = shallowRef<File | null>(null)
  const result = shallowRef<SvgFixer.SvgFixResult | null>(null)

  function reset() {
    original.value = null
    result.value = null
    error.value = null
  }

  // A new upload starts over; the fix's own file doesn't
  let replacing = false
  const replace = (file: File | null) => {
    replacing = true
    image.file.value = file
  }
  watch(image.file, () => {
    if (replacing) replacing = false
    else reset()
  })

  async function fix(options: Omit<SvgFixer.SvgFixOptions, 'fileName'>) {
    const file = image.file.value
    if (!file || !image.content.value) return
    fixing.value = true
    error.value = null
    try {
      const { fixSvg } = await loadSvgFixer()
      const fixed = fixSvg(image.content.value, {
        ...options,
        fileName: file.name,
        mergePaths: mergePaths.value,
      })
      original.value = file
      result.value = fixed
      if (fixed.fixed) {
        replace(new File([fixed.content], file.name, { type: 'image/svg+xml' }))
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      fixing.value = false
    }
  }

  function undo() {
    replace(original.value)
    reset()
  }

  // Saves the fixed file under `name`, the one the repo expects
  function download(name: string) {
    const file = image.file.value
    if (!file) return
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = name
    link.click()
    URL.revokeObjectURL(url)
  }

  return {
    fixing,
    error,
    mergePaths,
    original,
    result,
    fix,
    undo,
    reset,
    download,
  }
}
