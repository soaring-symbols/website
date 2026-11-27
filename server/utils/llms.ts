import type { Airline, Alliance } from 'soaring-symbols'
import { listAirlines, listAlliances } from 'soaring-symbols'

// /llms.txt and /llms-full.txt (https://llmstxt.org): what the site, its
// API, the MCP server and the package offer, for AI assistants that read the
// web. Prerendered like the sitemap, so they always match the package.

const REPO = 'https://github.com/soaring-symbols/soaring-symbols'

// The summary and the sections both files start with
function llmsIndex(origin: string) {
  const url = (path: string) => new URL(path, origin).href
  const airlines = listAirlines()

  return `# Soaring Symbols

> A curated collection of airline and alliance logos, icons and tail designs in SVG, with each airline's IATA and ICAO codes, callsign, country, hubs, alliance, founding year and brand color. ${airlines.length} airlines and ${listAlliances().length} alliances, from soaring-symbols ${packageVersion} on npm.

Each airline has a slug, its name in lowercase with hyphens (vietnam-airlines). Its marks are \`icon\` (square symbol), \`logo\` (horizontal lockup), \`logo-stacked\` (vertical lockup, for some) and \`tail\` (fin design), each in color, often in a monochrome \`-mono\` version that takes any color, and in a \`-dark\` version for dark backgrounds. Older marks are kept by the year they came in. The marks are trademarks of their airlines: use them to identify the airline, never to suggest endorsement.

## Use the marks

- [MCP server](${url('/ecosystem#mcp')}): \`${url('/mcp')}\` over Streamable HTTP, no key needed. Tools: search_airlines, get_airline, get_mark (SVG source or PNG), list_alliances, get_alliance.
- [JSON API](${url('/api/airlines/VN')}): \`/api/airlines/<code>\` finds one airline by IATA or ICAO code, slug or name and returns its data with links to every SVG; \`/api/airlines\` lists all, \`?code=SL\` every airline holding a code, \`?cargo=true\` the cargo ones; \`/api/alliances\` and \`/api/alliances/<slug>\` for alliances. Open to any site, no key needed.
- [Image API](${url('/api/airlines/VN/icon.png')}): \`/api/airlines/<code>/<file>\`, where file is logo, logo-stacked, icon or tail, with -mono or -dark, ending in .svg or .png. \`?color=fff\` tints a monochrome mark, \`?dark=\` sets its color in dark mode (SVG), \`?size=\` the PNG width (16 to 1024), \`?viewbox=auto\` crops the canvas to the drawing. Alliances at \`/api/alliances/<slug>/<file>\`.
- [jsDelivr CDN](https://www.jsdelivr.com/package/npm/soaring-symbols): \`https://cdn.jsdelivr.net/npm/soaring-symbols/dist/airlines/<slug>/logo.svg\`, older marks under \`<slug>/history/<year>/\`, alliances under \`dist/alliances/<slug>/\`. unpkg serves the same paths.
- [npm package](https://www.npmjs.com/package/soaring-symbols): the SVGs, \`airlines.json\` and \`alliances.json\`, and a small JavaScript API (\`getAirline\`, \`findAirlines\`, \`listAirlines\`, \`getAssetPath\`, \`getAlliance\`).
- [API reference](${REPO}/blob/main/API.md): every function of the package and the fields of its data.
- [Ecosystem](${url('/ecosystem')}): every integration, from the CDNs and the API to the Raycast extension and the Figma, Framer, Webflow and Miro apps, with each parameter and setup step.

## Browse

- [Airlines](${url('/airlines')}): every airline, with its marks, codes, hubs and history
- [Alliances](${url('/alliances')}): each alliance's marks and members
- [Changelog](${url('/changelog')}): what each release added

## Contribute

- [Contributing guide](${REPO}/blob/main/CONTRIBUTING.md): how to add or update an airline, and the rules each SVG follows
- [Validate](${url('/validate')}): checks SVGs against those rules and fixes what it can, in the browser
`
}

// /llms.txt: the summary, plus a link to the full list
export function llmsTxt(origin: string) {
  return `${llmsIndex(origin)}
## Optional

- [Full list](${new URL('/llms-full.txt', origin).href}): every airline and alliance in the collection, with codes, country, hubs, alliance, brand color and marks
`
}

// One line per airline: what to find it by and which marks it has
function airlineLine(airline: Airline, origin: string) {
  const facts = [
    [airline.iata, airline.icao].filter(Boolean).join('/'),
    airline.callsign && `callsign ${airline.callsign}`,
    airline.country,
    airline.alliance,
    airline.hubs?.length && `hubs ${airline.hubs.join(', ')}`,
    airline.founded && `founded ${airline.founded}`,
    airline.cargo && 'cargo',
    airline.defunct &&
      (airline.ceased ? `defunct since ${airline.ceased}` : 'defunct'),
    airline.branding?.primary_color,
    markList(airline.assets),
    airline.history?.length &&
      `older marks from ${airline.history.map((era) => era.since).join(', ')}`,
    otherNames(airline),
    `slug ${airline.slug}`,
  ].filter(Boolean)

  return `- [${airline.name}](${new URL(`/airlines/${airline.slug}`, origin).href}): ${facts.join('; ')}`
}

function allianceLine(alliance: Alliance, members: number, origin: string) {
  const facts = [
    alliance.founded && `founded ${alliance.founded}`,
    alliance.defunct &&
      (alliance.ceased ? `defunct since ${alliance.ceased}` : 'defunct'),
    `${members} member${members === 1 ? '' : 's'} in the collection`,
    alliance.branding?.primary_color,
    markList(alliance.assets),
    `slug ${alliance.slug}`,
  ].filter(Boolean)

  return `- [${alliance.name}](${new URL(`/alliances/${alliance.slug}`, origin).href}): ${facts.join('; ')}`
}

// 'icon (mono, dark), logo': each mark with the versions besides color
function markList(assets: Airline['assets'] | Alliance['assets']) {
  const marks = Object.entries(assets).map(([type, asset]) => {
    const versions = [asset?.mono && 'mono', asset?.dark && 'dark'].filter(
      Boolean,
    )

    return versions.length ? `${type} (${versions.join(', ')})` : type
  })

  return marks.length ? `marks ${marks.join(', ')}` : 'no marks yet'
}

// Shorter names it goes by, and names it flew under before
function otherNames(airline: Airline) {
  const aliases = (airline.aliases ?? []).map(({ name }) => name)
  const former = (airline.former ?? []).flatMap(({ name, until }) =>
    name ? [`${name} until ${until}`] : [],
  )

  return [
    aliases.length && `also ${aliases.join(', ')}`,
    former.length && `formerly ${former.join(', ')}`,
  ]
    .filter(Boolean)
    .join('; ')
}

export function llmsFull(origin: string) {
  const airlines = listAirlines()
  const alliances = listAlliances().map((alliance) =>
    allianceLine(
      alliance,
      airlines.filter((airline) => airline.alliance === alliance.name).length,
      origin,
    ),
  )

  return `${llmsIndex(origin)}
## Airlines

Each line: IATA/ICAO codes; callsign; country (ISO 3166-1); alliance; hubs (IATA airport codes); founding year; cargo or defunct; brand color; marks, with their monochrome and dark versions; other names; slug. The JSON API has the full entry at /api/airlines/<slug>.

${airlines.map((airline) => airlineLine(airline, origin)).join('\n')}

## Alliances

${alliances.join('\n')}
`
}
