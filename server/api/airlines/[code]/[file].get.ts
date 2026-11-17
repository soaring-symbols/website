import { getAirline } from 'soaring-symbols'

// One mark of an airline, found by IATA code, ICAO code, slug or name:
// /api/airlines/VN/logo.svg, /api/airlines/hvn/icon-mono.png?color=fff&size=64
// (the query is described at sendMark)
export default defineEventHandler(async (event) => {
  setApiHeaders(event)
  const code = getRouterParam(event, 'code', { decode: true }) ?? ''
  const file = getRouterParam(event, 'file', { decode: true }) ?? ''

  const image = parseImageFile(file, 'airlines')
  if (!image) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Unknown file',
      message: `"${file}" is not a mark. Try logo.svg, icon-mono.svg, logo-stacked.svg or tail.png.`,
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

  const svg = await readMarkSvg('airlines', airline, image)
  if (!svg) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Mark not found',
      message: `${airline.name} has no ${file.toLowerCase()}. Its links are listed at /api/airlines/${airline.slug}.`,
    })
  }

  return sendMark(event, svg, image)
})
