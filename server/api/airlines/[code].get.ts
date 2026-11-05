import { getAirline } from 'soaring-symbols'

// One airline by IATA code, ICAO code, slug or name, case-insensitive:
// /api/airlines/VN, /api/airlines/hvn, /api/airlines/vietnam-airlines
export default defineEventHandler((event) => {
  setApiHeaders(event)
  const code = getRouterParam(event, 'code', { decode: true }) ?? ''
  const airline = getAirline(code)
  if (!airline) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Airline not found',
      message: `No airline matches "${code}". Try an IATA or ICAO code, or a slug.`,
    })
  }

  return toApiAirline(airline, apiOrigin(event))
})
