// Pixel comparison of two SVGs rendered at the same size.
//
// Separate paths that touch are anti-aliased on their own, so merging or
// re-optimizing paths shifts a thin line of edge pixels even when the shapes
// are identical. Those edge differences shrink relative to the image as the
// render size grows, while a real shape change keeps the same share, so the
// two are told apart by comparing a small and a large render.

export type CompareVerdict = 'identical' | 'edges' | 'shapes'

export interface CompareRender {
  size: number
  diffPixels: number
  // Differing pixels as a share of the pixels either SVG draws on
  share: number
}

export interface CompareResult {
  verdict: CompareVerdict
  renders: CompareRender[]
  maxDelta: number
  mask: ImageData
}

export interface MaskColors {
  diff: [number, number, number]
  shape: [number, number, number]
}

const SIZES = [512, 2048]
// Channel delta above which a pixel counts as different (half coverage)
const THRESHOLD = 128
// Edge-only differences shrink ~4x between 512 and 2048 px; shape changes don't
const EDGE_SHRINK = 2.5

async function rasterize(content: string, size: number) {
  const svg = parseSvg(content)
  if (!svg) throw new Error('Invalid SVG')
  svg.setAttribute('width', String(size))
  svg.setAttribute('height', String(size))
  const blob = new Blob([new XMLSerializer().serializeToString(svg)], {
    type: 'image/svg+xml',
  })
  const url = URL.createObjectURL(blob)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = size
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!
    ctx.drawImage(img, 0, 0, size, size)

    return ctx.getImageData(0, 0, size, size).data
  } finally {
    URL.revokeObjectURL(url)
  }
}

function diffPixels(a: Uint8ClampedArray, b: Uint8ClampedArray) {
  let diff = 0
  let drawn = 0
  let maxDelta = 0
  for (let i = 0; i < a.length; i += 4) {
    if (a[i + 3] || b[i + 3]) drawn++
    const delta = Math.max(
      Math.abs(a[i] - b[i]),
      Math.abs(a[i + 1] - b[i + 1]),
      Math.abs(a[i + 2] - b[i + 2]),
      Math.abs(a[i + 3] - b[i + 3]),
    )
    if (delta > THRESHOLD) diff++
    if (delta > maxDelta) maxDelta = delta
  }

  return { diff, drawn, maxDelta }
}

function buildMask(
  a: Uint8ClampedArray,
  b: Uint8ClampedArray,
  size: number,
  colors: MaskColors,
) {
  const mask = new ImageData(size, size)
  for (let i = 0; i < a.length; i += 4) {
    const delta = Math.max(
      Math.abs(a[i] - b[i]),
      Math.abs(a[i + 1] - b[i + 1]),
      Math.abs(a[i + 2] - b[i + 2]),
      Math.abs(a[i + 3] - b[i + 3]),
    )
    const drawn = a[i + 3] || b[i + 3]
    if (delta > THRESHOLD) {
      mask.data.set([...colors.diff, 255], i)
    } else if (drawn) {
      mask.data.set([...colors.shape, 255], i)
    }
  }

  return mask
}

function getVerdict(renders: CompareRender[]): CompareVerdict {
  const [small, large] = renders
  if (renders.every((r) => r.diffPixels === 0)) return 'identical'
  if (small.diffPixels === 0) return 'edges'

  return small.share / Math.max(large.share, Number.EPSILON) >= EDGE_SHRINK
    ? 'edges'
    : 'shapes'
}

export async function compareSvgs(
  before: string,
  after: string,
  colors: MaskColors,
): Promise<CompareResult> {
  const renders: CompareRender[] = []
  let maxDelta = 0
  let mask: ImageData | null = null

  for (const size of SIZES) {
    const [a, b] = await Promise.all([
      rasterize(before, size),
      rasterize(after, size),
    ])
    const result = diffPixels(a, b)
    renders.push({
      size,
      diffPixels: result.diff,
      share: result.drawn ? result.diff / result.drawn : 0,
    })
    if (size === SIZES[0]) {
      maxDelta = result.maxDelta
      mask = buildMask(a, b, size, colors)
    }
  }

  return { verdict: getVerdict(renders), renders, maxDelta, mask: mask! }
}
