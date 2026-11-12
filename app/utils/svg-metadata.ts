export interface SvgMetadata {
  dimensions: string
  paths: number | string
  colors: number | string
  fileSize: string
  viewBox: string
}

// Raster images have no paths, colors list or viewBox to report
export function getRasterMetadata(
  width: number,
  height: number,
  bytes: number,
): SvgMetadata {
  return {
    dimensions: `${width} × ${height}`,
    paths: '—',
    colors: '—',
    fileSize: formatBytes(bytes),
    viewBox: '—',
  }
}

export function formatBytes(bytes: number): string {
  return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`
}

export function parseSvg(content: string): SVGSVGElement | null {
  const doc = new DOMParser().parseFromString(content, 'image/svg+xml')

  return doc.querySelector('svg')
}

export function getSvgColors(svg: SVGSVGElement): Set<string> {
  const colors = new Set<string>()
  // Include the root: single-color assets set their fill on <svg> itself
  ;[svg, ...svg.querySelectorAll('*')].forEach((el) => {
    const fill = el.getAttribute('fill')
    const stroke = el.getAttribute('stroke')
    if (fill && fill !== 'none' && fill !== 'currentColor')
      colors.add(fill.toLowerCase())
    if (stroke && stroke !== 'none' && stroke !== 'currentColor')
      colors.add(stroke.toLowerCase())
  })

  return colors
}

// No color of its own: no fill or stroke color, and no <style> that could
// hold one, so it draws in currentColor or the default black
export function hasNoOwnColor(svg: SVGSVGElement): boolean {
  return !svg.querySelector('style') && getSvgColors(svg).size === 0
}

// Drawn only in currentColor, with no colors of its own (a -mono.svg)
export function isMonoSvg(svg: SVGSVGElement): boolean {
  return /currentColor/i.test(svg.outerHTML) && getSvgColors(svg).size === 0
}

export function getSvgMetadata(
  svg: SVGSVGElement,
  bytes: number,
  bbox: DOMRect | null,
): SvgMetadata {
  const viewBox = svg.getAttribute('viewBox') ?? 'missing'
  const r = (n: number) => Math.round(n * 1000) / 1000
  const dimensions = bbox
    ? `${r(bbox.width)} × ${r(bbox.height)}`
    : viewBox !== 'missing'
      ? viewBox.split(' ').slice(2).join(' × ')
      : '—'

  return {
    dimensions,
    paths: svg.querySelectorAll('path').length,
    // A -mono.svg has no colors of its own: it takes the text color
    colors: getSvgColors(svg).size || (isMonoSvg(svg) ? 'currentColor' : 0),
    fileSize: formatBytes(bytes),
    viewBox,
  }
}
