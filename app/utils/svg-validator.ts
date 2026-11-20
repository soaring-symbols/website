import slugify from 'slugify'
import type { SvgValidation } from 'soaring-symbols/svg-validator'

export type { SvgValidation }
export { runSvgValidations } from 'soaring-symbols/svg-validator'

// Warnings are advice, as in `lint-svg.js --check`: they never fail an SVG
export const isWarning = (check: SvgValidation) => check.level === 'warning'

// Snapped to 1e-5, as the package snaps geometry offsets, which drops
// getBBox()'s float32 noise (11.9995 measures 11.99949997)
const snap = (n: number) => Math.round(n * 1e5) / 1e5

// Three decimals, as the package shows them
const r3 = (n: number) => Math.round(Math.round(n * 1e5) / 100) / 1000

// Three decimals, rounded away from `target` so a value off it never reads
// as it: 11.9995 shows as 11.999 and 12.0005 as 12.001, not 12
function away(n: number, target: number) {
  const s = snap(n)
  if (s < target) return Math.floor(Math.round(s * 1e5) / 100) / 1000
  if (s > target) return Math.ceil(Math.round(s * 1e5) / 100) / 1000
  return r3(s)
}

// The package passes geometry up to 0.0005 off, so one exactly 0.0005 off (a
// center between edges 0.001 apart, 11.9995, or an edge written at four
// decimals, 63.9995) passes yet reads as 11.999 or 64. The website alone
// turns such a pass into a warning, with a hint: it is often what's left of
// optimizing at too few decimals, which one more can avoid. The CLI and the
// guidelines still pass it; less than 0.0005 off reads as the target and
// stays a pass.

// The decimals a file is written with: the most any of its numbers has,
// from three to five, as the package's `precisionOf` reads it
const PRECISIONS = [3, 4, 5]
export const precisionOf = (source: string) =>
  PRECISIONS.findLast((p) => new RegExp(String.raw`\.\d{${p}}`).test(source)) ??
  PRECISIONS[0]

// What to try at the file's precision: one decimal more, up to the five the
// guidelines allow, past which only the artwork itself can move
export function precisionHint(source: string) {
  const precision = precisionOf(source)
  if (precision >= 5)
    return 'Written at 5 decimals, the most the guidelines allow: move the artwork in an editor so it sits exactly.'
  return `Written at ${precision} decimals, which often leaves this: optimize the original file again at ${precision + 1} (SVGO’s precision ${precision + 1}) and check it here.`
}

export function flagNearMisses(
  checks: SvgValidation[],
  type: 'logo' | 'icon',
  bbox: DOMRect | null,
  source = '',
): (SvgValidation & { hint?: string })[] {
  if (!bbox) return checks

  const size = type === 'logo' ? 64 : 24
  const half = size / 2
  const { x, y, width, height } = bbox
  const right = x + width
  const bottom = y + height
  const cx = x + width / 2
  const cy = y + height / 2
  const longest = Math.max(width, height)
  const short = snap(size - longest)
  const overflow = snap(Math.max(-x, -y, right - size, bottom - size, 0))
  const offCenter = snap(Math.max(Math.abs(cx - half), Math.abs(cy - half)))
  const side = (n: number) => (n === longest ? away(n, size) : r3(n))
  const dims = `${side(width)} × ${side(height)}`

  // Each check's offset and its detail, worded as the package words them
  const offsets: Record<string, [number, string]> = {
    'Fills viewBox': [
      short,
      `${dims}, ${away(short, 0)} short of ${size} in the largest dimension`,
    ],
    'Fits viewBox': [
      overflow,
      `extends to (${away(x, 0)}, ${away(y, 0)}) → (${away(right, size)}, ${away(bottom, size)}), ${away(overflow, 0)} past the edge`,
    ],
    Centered: [
      offCenter,
      `center (${away(cx, half)}, ${away(cy, half)}), ${away(offCenter, 0)} off (${half}, ${half})`,
    ],
  }

  return checks.map((check) => {
    const near = check.group === 'Geometry' && offsets[check.label]
    if (!check.pass || !near || near[0] < 0.0005) return check

    return {
      ...check,
      pass: false,
      level: 'warning',
      detail: near[1],
      hint: precisionHint(source),
    }
  })
}

export function computeSvgBBox(svgEl: SVGSVGElement): DOMRect | null {
  const ns = 'http://www.w3.org/2000/svg'
  const container = document.createElementNS(ns, 'svg') as SVGSVGElement
  container.setAttribute('xmlns', ns)
  container.style.cssText =
    'position:absolute;left:-9999px;top:-9999px;visibility:hidden;pointer-events:none;'
  const vb = svgEl.getAttribute('viewBox')
  if (vb) container.setAttribute('viewBox', vb)
  Array.from(svgEl.children).forEach((child) => {
    if (child.tagName.toLowerCase() !== 'title')
      container.appendChild(child.cloneNode(true))
  })
  document.body.appendChild(container)
  let bbox: DOMRect | null = null
  try {
    bbox = container.getBBox()
  } catch {
    // nothing
  }
  document.body.removeChild(container)
  return bbox && bbox.width > 0 ? bbox : null
}

export type AssetType = 'logo' | 'icon'

export interface DetectedType {
  type: AssetType
  source: 'file name' | 'viewBox'
}

// Guess whether an upload is a logo or an icon. The file name (logo.svg,
// icon.svg, tail.svg and their -mono variants) is the project convention and
// states the intent, so it wins; the viewBox is only a fallback, otherwise a
// logo with an icon-sized viewBox would be validated as an icon and pass.
export function detectAssetType(
  svg: SVGSVGElement,
  fileName: string,
): DetectedType | null {
  const name = fileName.toLowerCase()
  if (/(^|[^a-z])(icon|tail)/.test(name))
    return { type: 'icon', source: 'file name' }
  if (/(^|[^a-z])logo/.test(name)) return { type: 'logo', source: 'file name' }

  const [, , width, height] = (svg.getAttribute('viewBox') ?? '')
    .trim()
    .split(/[\s,]+/)
    .map(Number)
  const size = Math.max(width || 0, height || 0)
  if (size === 24) return { type: 'icon', source: 'viewBox' }
  if (size === 64) return { type: 'logo', source: 'viewBox' }

  return null
}

// The folder name an airline's files go in, made as the package's toSlug()
// makes it: "T'way Air" gives 'tway-air', "Jet2.com" 'jet2com'. The
// catalog's own slug wins for an airline it has.
export function airlineSlug(name: string): string {
  return slugify(name, { lower: true, strict: true })
}

// What an upload is in the repo: a logo, stacked logo, icon or tail. A tail
// is checked as an icon and a stacked logo as a logo, so only the file name
// tells them apart.
export function assetKind(
  type: AssetType,
  uploadedName: string,
): AssetType | 'tail' | 'logo-stacked' {
  if (/(^|[^a-z])tail/i.test(uploadedName)) return 'tail'
  if (type === 'logo' && /logo-stacked/i.test(uploadedName)) {
    return 'logo-stacked'
  }

  return type
}
