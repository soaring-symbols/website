import { getAirline } from 'soaring-symbols'

// One mark of an airline, found by IATA code, ICAO code, slug or name:
// /api/airlines/VN/logo.svg, /api/airlines/hvn/icon-mono.png?color=fff&size=64
//
// - color: hex for a monochrome mark (default: black, or currentColor in SVG)
// - dark: hex for a monochrome SVG when the viewer is in dark mode
// - size: PNG width in pixels, 16 to 1024 (default 256)
export default defineEventHandler(async (event) => {
  setApiHeaders(event)
  const code = getRouterParam(event, 'code', { decode: true }) ?? ''
  const file = getRouterParam(event, 'file', { decode: true }) ?? ''

  const image = parseImageFile(file)
  if (!image) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Unknown file',
      message: `"${file}" is not a mark. Try logo.svg, icon-mono.svg or tail.png.`,
    })
  }

  const airline = getAirline(code)
  if (!airline) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Airline not found',
      message: `No airline matches "${code}". Try an IATA or ICAO code, or a slug.`,
    })
  }

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

  const svg = await readAirlineSvg(airline, image)
  if (!svg) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Mark not found',
      message: `${airline.name} has no ${file.toLowerCase()}. Its links are listed at /api/airlines/${airline.slug}.`,
    })
  }
  const tinted = image.mono ? tintMonoSvg(svg, { color, dark }) : svg

  if (image.format === 'svg') {
    setResponseHeader(event, 'content-type', 'image/svg+xml; charset=utf-8')

    return tinted
  }

  setResponseHeader(event, 'content-type', 'image/png')

  return renderPng(tinted, readSize(query.size))
})

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
