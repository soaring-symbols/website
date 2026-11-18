import { findAirlines, listAirlines } from 'soaring-symbols'

// Every airline in the package, sorted by name. With ?code=, every airline
// holding that IATA or ICAO code instead, the one /api/airlines/<code>
// returns first (SL: Thai Lion Air, then SAS Connect); add &former=true for
// the airlines that held it before too. ?cargo=true keeps only the cargo
// airlines and cargo brands, ?cargo=false only the others.
export default defineEventHandler((event) => {
  setApiHeaders(event)
  const origin = apiOrigin(event)
  const { code, former, cargo } = getQuery(event)
  const found =
    typeof code === 'string'
      ? findAirlines(code, { former: former === 'true' })
      : listAirlines()
  const kept =
    cargo === 'true' || cargo === 'false'
      ? found.filter((airline) => !!airline.cargo === (cargo === 'true'))
      : found
  const airlines = kept.map((airline) => toApiAirline(airline, origin))

  return { version: packageVersion, count: airlines.length, airlines }
})
