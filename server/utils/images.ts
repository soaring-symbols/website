import type { Airline, Alliance, AssetType } from 'soaring-symbols'
import type { H3Event } from 'h3'
import { initWasm, Resvg } from '@resvg/resvg-wasm'
// Compiled once at build time: Workers refuse to compile WebAssembly at runtime
import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm?module'

export const PNG_SIZE = { default: 256, min: 16, max: 1024 }

export interface ImageRequest {
  type: AssetType
  mono: boolean
  dark: boolean
  format: 'svg' | 'png'
}

// The marks each kind of entry ships: alliances have no tail, and no
// stacked logo
export const MARK_TYPES = {
  airlines: ['icon', 'logo', 'logo-stacked', 'tail'],
  alliances: ['icon', 'logo'],
} as const satisfies Record<string, readonly AssetType[]>

export type MarkSource = keyof typeof MARK_TYPES

// 'logo.svg', 'icon-mono.png', 'logo-stacked-dark.svg': the package's file names, as SVG or PNG,
// for a type the source ships
export function parseImageFile(
  file: string,
  source: MarkSource,
): ImageRequest | undefined {
  const match = /^([a-z]+(?:-stacked)?)(-mono|-dark)?\.(svg|png)$/.exec(
    file.toLowerCase(),
  )
  if (!match) return undefined
  if (!(MARK_TYPES[source] as readonly string[]).includes(match[1]!)) {
    return undefined
  }

  return {
    type: match[1] as AssetType,
    mono: match[2] === '-mono',
    dark: match[2] === '-dark',
    format: match[3] as 'svg' | 'png',
  }
}

// 'fff', '#00ccff' → '#00ccff'; anything else → undefined
export function parseHexColor(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const hex = value.replace(/^#/, '').toLowerCase()
  if (/^[0-9a-f]{6}$/.test(hex)) return `#${hex}`
  if (/^[0-9a-f]{3}$/.test(hex)) {
    return `#${[...hex].map((digit) => digit + digit).join('')}`
  }

  return undefined
}

// The SVG as the package ships it, from the copy of the airlines' or the
// alliances' marks bundled into the Worker
export async function readMarkSvg(
  source: MarkSource,
  entry: Airline | Alliance,
  { type, mono, dark }: ImageRequest,
) {
  const asset = (entry.assets as Airline['assets'])[type]
  const variant = mono ? 'mono' : dark ? 'dark' : 'color'
  if (!asset?.[variant]) return undefined
  const suffix = variant === 'color' ? '' : `-${variant}`
  const name = `${entry.slug}:${type}${suffix}.svg`

  // Bundled files come back as bytes on Workers, and as text elsewhere
  const raw = await useStorage(`assets:${source}`).getItemRaw(name)
  if (!raw) return undefined

  return typeof raw === 'string' ? raw : new TextDecoder().decode(raw)
}

// Monochrome marks paint with currentColor, which an <img> or a PNG renders
// black: set the color on the root, and a second one for dark mode
export function tintMonoSvg(
  svg: string,
  { color, dark }: { color?: string; dark?: string },
) {
  let tinted = color
    ? svg.replace('fill="currentColor"', `fill="${color}"`)
    : svg
  if (dark) {
    // After the <title>, which stays the first child for screen readers
    const style = `<style>@media (prefers-color-scheme:dark){svg{fill:${dark}}}</style>`
    tinted = tinted.includes('</title>')
      ? tinted.replace('</title>', `</title>${style}`)
      : tinted.replace(/(<svg\b[^>]*>)/, `$1${style}`)
  }

  return tinted
}

let ready: Promise<void> | undefined

export async function renderPng(svg: string, width: number) {
  ready ??= initWasm(resvgWasm)
  await ready
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: width } })
  try {
    return resvg.render().asPng()
  } finally {
    resvg.free()
  }
}

// The image API's answer for a mark that exists: the SVG as is or tinted,
// or a PNG of it, after checking the query asks for something it can do
//
// - color: hex for a monochrome mark (default: black, or currentColor in SVG)
// - dark: hex for a monochrome SVG when the viewer is in dark mode
// - size: PNG width in pixels, 16 to 1024 (default 256)
export function sendMark(event: H3Event, svg: string, image: ImageRequest) {
  const query = getQuery(event)
  const color = readColor(query.color, 'color')
  const dark = readColor(query.dark, 'dark')
  if ((color || dark) && !image.mono) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Color needs a monochrome mark',
      message: `Only monochrome marks take a color. Try ${image.type}-mono.${image.format}.`,
    })
  }
  if (dark && image.format === 'png') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Dark mode needs an SVG',
      message: 'A PNG has one color; request one per theme with color instead.',
    })
  }
  const size = image.format === 'png' ? readSize(query.size) : undefined
  const tinted = image.mono ? tintMonoSvg(svg, { color, dark }) : svg

  if (!size) {
    setResponseHeader(event, 'content-type', 'image/svg+xml; charset=utf-8')

    return tinted
  }

  setResponseHeader(event, 'content-type', 'image/png')

  return renderPng(tinted, size)
}

function readColor(value: unknown, name: string) {
  if (value === undefined || value === '') return undefined
  const color = parseHexColor(value)
  if (!color) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid ${name}`,
      message: `${name} must be a hex color such as fff or 00ccff.`,
    })
  }

  return color
}

function readSize(value: unknown) {
  if (value === undefined || value === '') return PNG_SIZE.default
  const size = Number(value)
  if (!Number.isInteger(size) || size < PNG_SIZE.min || size > PNG_SIZE.max) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid size',
      message: `size must be a whole number from ${PNG_SIZE.min} to ${PNG_SIZE.max}.`,
    })
  }

  return size
}
