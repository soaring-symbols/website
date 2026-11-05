import { listAirlines } from 'soaring-symbols'

// Every airline in the package, sorted by name
export default defineEventHandler((event) => {
  setApiHeaders(event)
  const origin = apiOrigin(event)
  const airlines = listAirlines().map((airline) =>
    toApiAirline(airline, origin),
  )

  return { version: packageVersion, count: airlines.length, airlines }
})
