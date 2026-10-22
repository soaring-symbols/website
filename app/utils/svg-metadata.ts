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
    colors: getSvgColors(svg).size,
    fileSize: formatBytes(bytes),
    viewBox,
  }
}
