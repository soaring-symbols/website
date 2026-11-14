import { getAlliance } from 'soaring-symbols'

// One mark of an alliance, found by name or slug, case-insensitive:
// /api/alliances/skyteam/icon.svg, /api/alliances/oneworld/icon-mono.png?color=fff
// (the query is described at sendMark, the same as an airline's)
export default defineEventHandler(async (event) => {
  setApiHeaders(event)
  const name = getRouterParam(event, 'name', { decode: true }) ?? ''
  const file = getRouterParam(event, 'file', { decode: true }) ?? ''

  const image = parseImageFile(file, 'alliances')
  if (!image) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Unknown file',
      message: `"${file}" is not an alliance mark. Try icon.svg, icon-mono.svg or logo.png.`,
    })
  }

  const alliance = getAlliance(name)
  if (!alliance) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Alliance not found',
      message: `No alliance matches "${name}". Try its name or slug, e.g. skyteam.`,
    })
  }

  const svg = await readMarkSvg('alliances', alliance, image)
  if (!svg) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Mark not found',
      message: `${alliance.name} has no ${file.toLowerCase()} yet. Its links are listed at /api/alliances/${alliance.slug}.`,
    })
  }

  return sendMark(event, svg, image)
})
