import type { Airline, AssetType } from 'soaring-symbols'
import { initWasm, Resvg } from '@resvg/resvg-wasm'
// Compiled once at build time: Workers refuse to compile WebAssembly at runtime
import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm?module'

export const PNG_SIZE = { default: 256, min: 16, max: 1024 }

export interface ImageRequest {
  type: AssetType
  mono: boolean
  format: 'svg' | 'png'
}

// 'logo.svg', 'icon-mono.png': the package's file names, as SVG or PNG
export function parseImageFile(file: string): ImageRequest | undefined {
  const match = /^(icon|logo|tail)(-mono)?\.(svg|png)$/.exec(file.toLowerCase())
  if (!match) return undefined

  return {
    type: match[1] as AssetType,
    mono: Boolean(match[2]),
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

// The SVG as the package ships it, from the copy bundled into the Worker
export async function readAirlineSvg(
  airline: Airline,
  { type, mono }: ImageRequest,
) {
  const asset = airline.assets[type]
  if (!(mono ? asset?.mono : asset?.color)) return undefined
  const name = `${airline.slug}:${type}${mono ? '-mono' : ''}.svg`

  // Bundled files come back as bytes on Workers, and as text elsewhere
  const raw = await useStorage('assets:airlines').getItemRaw(name)
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
