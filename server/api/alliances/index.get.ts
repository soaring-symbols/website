import { listAlliances } from 'soaring-symbols'

// Every alliance an airline may name, sorted by name, those without marks
// yet included
export default defineEventHandler((event) => {
  setApiHeaders(event)
  const origin = apiOrigin(event)
  const alliances = listAlliances().map((alliance) =>
    toApiAlliance(alliance, origin),
  )

  return { version: packageVersion, count: alliances.length, alliances }
})
