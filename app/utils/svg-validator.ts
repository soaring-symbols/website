export type { SvgValidation } from 'soaring-symbols/svg-validator'
export { runSvgValidations } from 'soaring-symbols/svg-validator'

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
