// Visual comparison of two images, in one of two modes:
//
// - "pixel": both are SVGs, rendered at the same size and compared pixel by
//   pixel. Separate paths that touch are anti-aliased on their own, so merging
//   or re-optimizing paths shifts a thin line of edge pixels even when the
//   shapes are identical. Those edge differences shrink relative to the image
//   as the render size grows, while a real shape change keeps the same share,
//   so the two are told apart by comparing a small and a large render.
// - "outline": at least one side is a raster reference (PNG, JPEG, WebP) with
//   its own size, padding and background. Backgrounds are removed, both images
//   are trimmed to their content and fitted into the same box, and the shapes
//   are compared with a small tolerance for anti-aliased and traced edges.

export type Rgb = [number, number, number]

export type CompareSource =
  { kind: 'svg'; content: string } | { kind: 'raster'; url: string }

export interface CompareColors {
  diff: Rgb
  extra: Rgb
  shape: Rgb
}

export interface CompareRender {
  size: number
  diffPixels: number
  // Differing pixels as a share of the pixels either side draws on
  share: number
}

export interface PixelResult {
  mode: 'pixel'
  verdict: 'identical' | 'edges' | 'shapes'
  renders: CompareRender[]
  mask: ImageData
  layers: [ImageData, ImageData]
}

export interface OutlineResult {
  mode: 'outline'
  verdict: 'match' | 'close' | 'differs'
  // Share of the union that lines up within the edge tolerance
  match: number
  // Shares of the union drawn by only one side, beyond the edge tolerance
  onlyBefore: number
  onlyAfter: number
  // Average color distance where both sides are fully opaque, from 0 to 1.
  // Edge pixels are left out since they blend with the background.
  colorDelta: number
  aspects: [number, number]
  mask: ImageData
  layers: [ImageData, ImageData]
}

export type CompareResult = PixelResult | OutlineResult

// Pixel mode
const PIXEL_SIZES = [512, 2048]
// Channel delta above which a pixel counts as different (half coverage)
const THRESHOLD = 128
// Edge-only differences shrink ~4x between 512 and 2048 px; shape changes don't
const EDGE_SHRINK = 2.5

// Outline mode
const OUTLINE_SIZE = 512
const SOURCE_MAX = 1024
// Mismatched pixels this close to the other shape are treated as edge noise
const EDGE_TOLERANCE = 2
const MATCH_SHARE = 0.01
const CLOSE_SHARE = 0.05
// Distance from the background color over which a pixel becomes fully opaque
const BG_NEAR = 32
const BG_FAR = 80

function newCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!

  return { canvas, ctx }
}

async function loadImage(url: string) {
  const img = new Image()
  img.src = url
  await img.decode()

  return img
}

async function renderSvg(content: string, size: number) {
  const svg = parseSvg(content)
  if (!svg) throw new Error('Invalid SVG')
  // Without width/height some browsers draw nothing for viewBox-only SVGs
  svg.setAttribute('width', String(size))
  svg.setAttribute('height', String(size))
  const blob = new Blob([new XMLSerializer().serializeToString(svg)], {
    type: 'image/svg+xml',
  })
  const url = URL.createObjectURL(blob)
  try {
    const img = await loadImage(url)
    const { canvas, ctx } = newCanvas(size, size)
    ctx.drawImage(img, 0, 0, size, size)

    return canvas
  } finally {
    URL.revokeObjectURL(url)
  }
}

async function renderRaster(url: string) {
  const img = await loadImage(url)
  const scale = Math.min(
    1,
    SOURCE_MAX / Math.max(img.naturalWidth, img.naturalHeight),
  )
  const width = Math.round(img.naturalWidth * scale)
  const height = Math.round(img.naturalHeight * scale)
  const { canvas, ctx } = newCanvas(width, height)
  ctx.drawImage(img, 0, 0, width, height)

  return canvas
}

const pixels = (canvas: HTMLCanvasElement) =>
  canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height)

const channelDelta = (a: Uint8ClampedArray, b: Uint8ClampedArray, i: number) =>
  Math.max(
    Math.abs(a[i] - b[i]),
    Math.abs(a[i + 1] - b[i + 1]),
    Math.abs(a[i + 2] - b[i + 2]),
    Math.abs(a[i + 3] - b[i + 3]),
  )

// --- Pixel mode ---

export async function compareSvgs(
  before: string,
  after: string,
  colors: CompareColors,
): Promise<PixelResult> {
  const renders: CompareRender[] = []
  let mask: ImageData | null = null
  let layers: [ImageData, ImageData] | null = null

  for (const size of PIXEL_SIZES) {
    const [a, b] = (
      await Promise.all([renderSvg(before, size), renderSvg(after, size)])
    ).map(pixels) as [ImageData, ImageData]
    // The difference map and overlay layers come from the smallest render
    const sizeMask = mask ? null : new ImageData(size, size)
    let diff = 0
    let drawn = 0
    for (let i = 0; i < a.data.length; i += 4) {
      const isDrawn = a.data[i + 3] || b.data[i + 3]
      if (isDrawn) drawn++
      if (channelDelta(a.data, b.data, i) > THRESHOLD) {
        diff++
        sizeMask?.data.set([...colors.diff, 255], i)
      } else if (isDrawn) {
        sizeMask?.data.set([...colors.shape, 255], i)
      }
    }
    renders.push({ size, diffPixels: diff, share: drawn ? diff / drawn : 0 })
    if (sizeMask) {
      mask = sizeMask
      layers = [a, b]
    }
  }

  const [small, large] = renders
  let verdict: PixelResult['verdict'] = 'shapes'
  if (renders.every((r) => r.diffPixels === 0)) verdict = 'identical'
  else if (
    small.diffPixels === 0 ||
    small.share / Math.max(large.share, Number.EPSILON) >= EDGE_SHRINK
  )
    verdict = 'edges'

  return { mode: 'pixel', verdict, renders, mask: mask!, layers: layers! }
}

// --- Outline mode ---

// Turn an opaque background into transparency, keyed on the corner color
function removeBackground(image: ImageData) {
  const { data, width, height } = image
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 250) return image
  }
  const corners = [0, width - 1, (height - 1) * width, height * width - 1]
  const bg = [0, 1, 2].map(
    (c) => corners.reduce((sum, p) => sum + data[p * 4 + c], 0) / 4,
  )
  for (let i = 0; i < data.length; i += 4) {
    const distance = Math.hypot(
      data[i] - bg[0],
      data[i + 1] - bg[1],
      data[i + 2] - bg[2],
    )
    const coverage = Math.min(
      1,
      Math.max(0, (distance - BG_NEAR) / (BG_FAR - BG_NEAR)),
    )
    data[i + 3] = Math.round(coverage * 255)
  }

  return image
}

function contentBox({ data, width, height }: ImageData) {
  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 127) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
  if (maxX < 0) throw new Error('One of the images has no visible content')

  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 }
}

// Trim to the content and fit it, centered, into an OUTLINE_SIZE square
async function align(source: CompareSource) {
  const canvas =
    source.kind === 'svg'
      ? await renderSvg(source.content, SOURCE_MAX)
      : await renderRaster(source.url)
  const image = removeBackground(pixels(canvas))
  canvas.getContext('2d')!.putImageData(image, 0, 0)
  const box = contentBox(image)
  const scale = OUTLINE_SIZE / Math.max(box.w, box.h)
  const w = box.w * scale
  const h = box.h * scale
  const { canvas: out, ctx } = newCanvas(OUTLINE_SIZE, OUTLINE_SIZE)
  ctx.drawImage(
    canvas,
    box.x,
    box.y,
    box.w,
    box.h,
    (OUTLINE_SIZE - w) / 2,
    (OUTLINE_SIZE - h) / 2,
    w,
    h,
  )

  return { image: pixels(out), aspect: box.w / box.h }
}

// Square dilation, done as a horizontal then a vertical pass
function dilate(mask: Uint8Array, size: number, radius: number) {
  const pass = (src: Uint8Array, horizontal: boolean) => {
    const out = new Uint8Array(src.length)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        for (let d = -radius; d <= radius; d++) {
          const nx = horizontal ? x + d : x
          const ny = horizontal ? y : y + d
          if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue
          if (src[ny * size + nx]) {
            out[y * size + x] = 1
            break
          }
        }
      }
    }

    return out
  }

  return pass(pass(mask, true), false)
}

export async function compareOutlines(
  before: CompareSource,
  after: CompareSource,
  colors: CompareColors,
): Promise<OutlineResult> {
  const [a, b] = await Promise.all([align(before), align(after)])
  const size = OUTLINE_SIZE
  const da = a.image.data
  const db = b.image.data
  const maskA = new Uint8Array(size * size)
  const maskB = new Uint8Array(size * size)
  for (let p = 0; p < size * size; p++) {
    maskA[p] = da[p * 4 + 3] > 127 ? 1 : 0
    maskB[p] = db[p * 4 + 3] > 127 ? 1 : 0
  }
  const nearA = dilate(maskA, size, EDGE_TOLERANCE)
  const nearB = dilate(maskB, size, EDGE_TOLERANCE)

  let union = 0
  let solid = 0
  let onlyBefore = 0
  let onlyAfter = 0
  let colorSum = 0
  const mask = new ImageData(size, size)
  for (let p = 0; p < size * size; p++) {
    const i = p * 4
    if (!maskA[p] && !maskB[p]) continue
    union++
    if (da[i + 3] === 255 && db[i + 3] === 255) {
      solid++
      colorSum +=
        Math.hypot(
          da[i] - db[i],
          da[i + 1] - db[i + 1],
          da[i + 2] - db[i + 2],
        ) / Math.hypot(255, 255, 255)
    }
    if (maskA[p] && !nearB[p]) {
      onlyBefore++
      mask.data.set([...colors.diff, 255], i)
    } else if (maskB[p] && !nearA[p]) {
      onlyAfter++
      mask.data.set([...colors.extra, 255], i)
    } else {
      mask.data.set([...colors.shape, 255], i)
    }
  }

  const mismatch = union ? (onlyBefore + onlyAfter) / union : 0
  const verdict =
    mismatch <= MATCH_SHARE
      ? 'match'
      : mismatch <= CLOSE_SHARE
        ? 'close'
        : 'differs'

  return {
    mode: 'outline',
    verdict,
    match: 1 - mismatch,
    onlyBefore: union ? onlyBefore / union : 0,
    onlyAfter: union ? onlyAfter / union : 0,
    colorDelta: solid ? colorSum / solid : 0,
    aspects: [a.aspect, b.aspect],
    mask,
    layers: [a.image, b.image],
  }
}
