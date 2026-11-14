import { getAlliance } from 'soaring-symbols'

// One alliance by name or slug, case-insensitive: /api/alliances/skyteam,
// /api/alliances/Star%20Alliance
export default defineEventHandler((event) => {
  setApiHeaders(event)
  const name = getRouterParam(event, 'name', { decode: true }) ?? ''
  const alliance = getAlliance(name)
  if (!alliance) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Alliance not found',
      message: `No alliance matches "${name}". Try its name or slug, e.g. skyteam.`,
    })
  }

  return toApiAlliance(alliance, apiOrigin(event))
})
