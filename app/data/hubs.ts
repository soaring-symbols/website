import airports from '#airports-data'

// Latitude and longitude of every hub an airline in the catalog lists, by
// IATA code, from the package's dist/airports.json (filled in from Wikidata
// when a hub is added), for the globe on an airline's page
export const HUBS = airports as Record<string, { lat: number; lon: number }>
