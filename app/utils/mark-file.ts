// What the menu on a mark's tile does with the file: its source as JSX or
// a data URI, a monochrome file in another color, and a PNG of it. All of
// it runs in the browser, so it works the same for older marks and
// alliances, which the image API doesn't serve.

// A monochrome file paints with currentColor on its root, as the image
// API's tintMonoSvg expects too; a color replaces it
export function tintSvg(svg: string, color?: string) {
  return color ? svg.replace('fill="currentColor"', `fill="${color}"`) : svg
}

// The attributes React spells in camelCase: fill-rule as fillRule,
// clip-path as clipPath, xlink:href as xlinkHref. aria-* and data-* keep
// their hyphens, and class becomes className
export function svgToJsx(svg: string) {
  return svg
    .replace(/\s([a-z]+(?:[-:][a-z]+)+)=/g, (match, name: string) =>
      /^(aria|data)-/.test(name)
        ? match
        : ` ${name.replace(/[-:]([a-z])/g, (_, c: string) => c.toUpperCase())}=`,
    )
    .replace(/\sclass=/g, ' className=')
}

// A data URI for CSS or an <img>: double quotes become single ones and only
// the characters a URI can't hold are escaped, so it stays short and
// readable, unlike base64
export function svgToDataUri(svg: string) {
  const body = svg
    .replace(/"/g, "'")
    .replace(/[\r\n%#()<>?[\\\]^`{|}]/g, encodeURIComponent)

  return `data:image/svg+xml,${body}`
}

// A PNG the given width, the height following the viewBox. The SVG gets that
// size written on its root first: without one, browsers draw it at 300×150
export async function svgToPng(svg: string, width: number) {
  const [, , w = 1, h = 1] =
    /viewBox="([^"]+)"/
      .exec(svg)?.[1]
      ?.trim()
      .split(/[\s,]+/)
      .map(Number) ?? []
  const height = Math.round((width * h) / w)
  const sized = svg.replace(
    /<svg\b/,
    `<svg width="${width}" height="${height}"`,
  )

  const url = URL.createObjectURL(new Blob([sized], { type: 'image/svg+xml' }))
  try {
    const image = new Image()
    image.src = url
    await image.decode()

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    canvas.getContext('2d')!.drawImage(image, 0, 0, width, height)

    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('No PNG'))),
        'image/png',
      ),
    )
  } finally {
    URL.revokeObjectURL(url)
  }
}

// Starts the download of a file made in the page
export function saveBlob(blob: Blob, name: string) {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = name
  link.click()
  // Freed after the browser has started the download
  setTimeout(() => URL.revokeObjectURL(link.href), 1000)
}
