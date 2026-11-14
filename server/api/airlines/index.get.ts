import { findAirlines, listAirlines } from 'soaring-symbols'

// Every airline in the package, sorted by name. With ?code=, every airline
// holding that IATA or ICAO code instead, the one /api/airlines/<code>
// returns first (SL: Thai Lion Air, then SAS Connect); add &former=true for
// the airlines that held it before too.
export default defineEventHandler((event) => {
  setApiHeaders(event)
  const origin = apiOrigin(event)
  const { code, former } = getQuery(event)
  const found =
    typeof code === 'string'
      ? findAirlines(code, { former: former === 'true' })
      : listAirlines()
  const airlines = found.map((airline) => toApiAirline(airline, origin))

  return { version: packageVersion, count: airlines.length, airlines }
})
