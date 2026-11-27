import type { Airline, Alliance, AssetType } from 'soaring-symbols'
import {
  getAirline,
  getAlliance,
  listAirlines,
  listAlliances,
} from 'soaring-symbols'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import { z } from 'zod'

// The MCP server behind /mcp: the same data and marks as the JSON and image
// API, as tools an AI assistant can call. Every tool only reads, and the
// answers change only with a package release.

const SEARCH_LIMIT = { default: 20, max: 100 }

const READ_ONLY = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const

const json = (value: unknown): CallToolResult => ({
  content: [{ type: 'text', text: JSON.stringify(value, null, 2) }],
})

const failure = (message: string): CallToolResult => ({
  isError: true,
  content: [{ type: 'text', text: message }],
})

const lower = (value: string) => value.trim().toLowerCase()

// What a search lists for each airline: enough to pick one and call
// get_airline with its slug
function summarize(airline: Airline, origin: string) {
  return {
    name: airline.name,
    slug: airline.slug,
    iata: airline.iata,
    icao: airline.icao,
    country: airline.country,
    ...(airline.alliance && { alliance: airline.alliance }),
    ...(airline.cargo && { cargo: true }),
    ...(airline.defunct && { defunct: true, ceased: airline.ceased }),
    marks: Object.keys(airline.assets),
    page: new URL(`/airlines/${airline.slug}`, origin).href,
  }
}

// How well an airline matches free text: 3 for one of its codes, 2 for a
// name it goes or went by, 1 for part of one; 0 for no match
function matchScore(airline: Airline, query: string) {
  const codes = [
    airline.iata,
    airline.icao,
    ...(airline.former ?? []).flatMap(({ iata, icao }) => [iata, icao]),
  ]
  if (codes.some((code) => code && lower(code) === query)) return 3
  const names = [
    airline.name,
    airline.slug,
    airline.callsign,
    ...(airline.aliases ?? []).map(({ name }) => name),
    ...(airline.former ?? []).map(({ name }) => name),
  ].flatMap((name) => (name ? [lower(name)] : []))
  if (names.includes(query)) return 2
  if (names.some((name) => name.includes(query))) return 1

  return 0
}

function membersOf(alliance: Alliance, origin: string) {
  return listAirlines()
    .filter((airline) => airline.alliance === alliance.name)
    .map((airline) => summarize(airline, origin))
}

// Uint8Array → base64 in pieces, since a Worker has no Buffer by default
function toBase64(bytes: Uint8Array) {
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }

  return btoa(binary)
}

export function createMcpServer(origin: string) {
  const server = new McpServer(
    { name: 'soaring-symbols', version: packageVersion },
    {
      instructions: [
        'Soaring Symbols is a curated collection of airline and alliance logos, icons and tail designs as SVG, with each airline’s codes, country, hubs, alliance and brand color.',
        'Find an airline with search_airlines, read it with get_airline, and fetch a mark with get_mark (SVG source to put in code, or a PNG to look at). Alliances: list_alliances and get_alliance.',
        'Marks are trademarks of their airlines: they are for identifying the airline, never to imply endorsement.',
        `Data from soaring-symbols ${packageVersion}.`,
      ].join(' '),
    },
  )

  server.registerTool(
    'search_airlines',
    {
      title: 'Search airlines',
      description:
        'Find airlines by name, alias, former name, IATA or ICAO code or callsign, and filter by country, alliance, hub, cargo or defunct. Returns a short summary of each (best matches first when query is given); call get_airline for the full entry.',
      inputSchema: {
        query: z
          .string()
          .optional()
          .describe(
            'Text to match: a code (VN, HVN), a name or part of one (vietnam), an alias (SWISS) or a former name',
          ),
        country: z
          .string()
          .length(2)
          .optional()
          .describe('ISO 3166-1 alpha-2 country code, e.g. VN'),
        alliance: z
          .string()
          .optional()
          .describe('Alliance name or slug, e.g. SkyTeam or star-alliance'),
        hub: z
          .string()
          .length(3)
          .optional()
          .describe('IATA airport code of a hub, e.g. SGN'),
        cargo: z
          .boolean()
          .optional()
          .describe('true for cargo airlines only, false for the others'),
        defunct: z
          .boolean()
          .optional()
          .describe(
            'true for airlines that ceased only, false for active ones only',
          ),
        limit: z
          .number()
          .int()
          .min(1)
          .max(SEARCH_LIMIT.max)
          .optional()
          .describe(
            `At most this many results (default ${SEARCH_LIMIT.default})`,
          ),
      },
      annotations: { ...READ_ONLY, title: 'Search airlines' },
    },
    ({ query, country, alliance, hub, cargo, defunct, limit }) => {
      let allianceName: string | undefined
      if (alliance) {
        allianceName = getAlliance(alliance)?.name
        if (!allianceName) {
          return failure(
            `No alliance matches "${alliance}". list_alliances lists them.`,
          )
        }
      }
      const text = query ? lower(query) : ''
      const matches = listAirlines()
        .filter(
          (airline) =>
            (!country || lower(airline.country) === lower(country)) &&
            (!allianceName || airline.alliance === allianceName) &&
            (!hub ||
              airline.hubs?.some((code) => lower(code) === lower(hub))) &&
            (cargo === undefined || !!airline.cargo === cargo) &&
            (defunct === undefined || !!airline.defunct === defunct),
        )
        .map((airline) => ({
          airline,
          score: text ? matchScore(airline, text) : 1,
        }))
        .filter(({ score }) => score > 0)
        // Stable, so equal scores stay in the catalog's order, by name
        .sort((a, b) => b.score - a.score)
      const shown = matches.slice(0, limit ?? SEARCH_LIMIT.default)

      return json({
        version: packageVersion,
        total: matches.length,
        airlines: shown.map(({ airline }) => summarize(airline, origin)),
      })
    },
  )

  server.registerTool(
    'get_airline',
    {
      title: 'Get an airline',
      description:
        'The full catalog entry of one airline, found by IATA code, ICAO code, slug or name (current, alias or former): codes, callsign, country, website, hubs, alliance, founding year, parent, brand color, which marks exist (assets, with their colors and whether mono and dark versions exist), older marks (history), plus links to its page and every SVG.',
      inputSchema: {
        airline: z
          .string()
          .describe('IATA code, ICAO code, slug or name, e.g. VN or swiss'),
      },
      annotations: { ...READ_ONLY, title: 'Get an airline' },
    },
    ({ airline: query }) => {
      const airline = getAirline(query)
      if (!airline) {
        return failure(
          `No airline matches "${query}". Try search_airlines to find it.`,
        )
      }

      return json(toApiAirline(airline, origin))
    },
  )

  server.registerTool(
    'list_alliances',
    {
      title: 'List alliances',
      description:
        'Every airline alliance in the catalog (Star Alliance, SkyTeam, oneworld, Vanilla Alliance, cargo alliances, defunct ones), with how many of the catalog’s airlines belong to each and which marks it has.',
      inputSchema: {},
      annotations: { ...READ_ONLY, title: 'List alliances' },
    },
    () =>
      json({
        version: packageVersion,
        alliances: listAlliances().map((alliance) => ({
          name: alliance.name,
          slug: alliance.slug,
          ...(alliance.defunct && { defunct: true, ceased: alliance.ceased }),
          members: membersOf(alliance, origin).length,
          marks: Object.keys(alliance.assets),
        })),
      }),
  )

  server.registerTool(
    'get_alliance',
    {
      title: 'Get an alliance',
      description:
        'One alliance by name or slug: its website, founding year, brand color, marks with links, and its member airlines in the catalog.',
      inputSchema: {
        alliance: z.string().describe('Name or slug, e.g. SkyTeam or oneworld'),
      },
      annotations: { ...READ_ONLY, title: 'Get an alliance' },
    },
    ({ alliance: query }) => {
      const alliance = getAlliance(query)
      if (!alliance) {
        return failure(
          `No alliance matches "${query}". list_alliances lists them.`,
        )
      }

      return json({
        ...toApiAlliance(alliance, origin),
        members: membersOf(alliance, origin),
      })
    },
  )

  server.registerTool(
    'get_mark',
    {
      title: 'Get a mark',
      description: [
        'One logo, icon or tail of an airline or alliance, as SVG source (to put in code or a design) or as a PNG image (to look at it).',
        'variant: color (the full-color mark), mono (one color: tint it with color, else it paints with currentColor in SVG and black in PNG) or dark (for dark backgrounds).',
        'since: a year from the entry’s history, for an older mark.',
        'Check get_airline or get_alliance first for which types and variants exist.',
      ].join(' '),
      inputSchema: {
        airline: z
          .string()
          .optional()
          .describe('IATA code, ICAO code, slug or name; or give alliance'),
        alliance: z
          .string()
          .optional()
          .describe('Alliance name or slug, instead of airline'),
        type: z
          .enum(['icon', 'logo', 'logo-stacked', 'tail'])
          .default('logo')
          .describe(
            'icon (square symbol), logo (horizontal lockup), logo-stacked (vertical lockup) or tail (fin design)',
          ),
        variant: z.enum(['color', 'mono', 'dark']).default('color'),
        color: z
          .string()
          .optional()
          .describe('Hex color for a mono mark, e.g. fff or #00ccff'),
        since: z
          .number()
          .int()
          .optional()
          .describe('Year an older mark was introduced, from history'),
        format: z
          .enum(['svg', 'png'])
          .default('svg')
          .describe('svg for the source, png to see the image'),
        size: z
          .number()
          .int()
          .min(PNG_SIZE.min)
          .max(PNG_SIZE.max)
          .optional()
          .describe(`PNG width in pixels (default ${PNG_SIZE.default})`),
        crop: z
          .boolean()
          .default(false)
          .describe(
            'Crop the square canvas to the drawing, so a wide logo fills a wide box',
          ),
      },
      annotations: { ...READ_ONLY, title: 'Get a mark' },
    },
    async (input) => {
      if (!!input.airline === !!input.alliance) {
        return failure('Give one of airline or alliance.')
      }
      const source: MarkSource = input.airline ? 'airlines' : 'alliances'
      const entry = input.airline
        ? getAirline(input.airline)
        : getAlliance(input.alliance!)
      if (!entry) {
        return failure(
          input.airline
            ? `No airline matches "${input.airline}". Try search_airlines.`
            : `No alliance matches "${input.alliance}". Try list_alliances.`,
        )
      }
      const type = input.type as AssetType
      if (!(MARK_TYPES[source] as readonly string[]).includes(type)) {
        return failure(`Alliances have no ${type}; try icon or logo.`)
      }
      if (
        input.since !== undefined &&
        !entry.history?.some((era) => era.since === input.since)
      ) {
        const years = entry.history?.map((era) => era.since) ?? []

        return failure(
          years.length
            ? `${entry.name} has no older marks from ${input.since}; its older marks are from ${years.join(', ')}.`
            : `${entry.name} has no older marks.`,
        )
      }
      const color = input.color && parseHexColor(input.color)
      if (input.color && !color) {
        return failure('color must be a hex color such as fff or 00ccff.')
      }
      if (color && input.variant !== 'mono') {
        return failure('Only mono marks take a color: set variant to mono.')
      }

      const mono = input.variant === 'mono'
      const dark = input.variant === 'dark'
      const svg = await readMarkSvg(
        source,
        entry,
        { type, mono, dark },
        input.since,
      )
      const file = `${type}${mono ? '-mono' : dark ? '-dark' : ''}`
      if (!svg) {
        return failure(
          `${entry.name} has no ${file}${input.since === undefined ? '' : ` from ${input.since}`}. get_${source === 'airlines' ? 'airline' : 'alliance'} lists the marks it has.`,
        )
      }

      const tinted = mono && color ? tintMonoSvg(svg, { color }) : svg
      const url = markUrl(origin, source, entry.slug, file, {
        since: input.since,
        format: input.format,
        color,
        size: input.size,
        crop: input.crop,
      })
      const about = `${entry.name} ${file}${input.since === undefined ? '' : ` (${input.since})`}: ${url}`

      if (input.format === 'png') {
        const png = await renderPng(
          tinted,
          input.size ?? PNG_SIZE.default,
          input.crop,
        )

        return {
          content: [
            { type: 'image', data: toBase64(png), mimeType: 'image/png' },
            { type: 'text', text: about },
          ],
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: input.crop ? await cropToDrawing(tinted) : tinted,
          },
          { type: 'text', text: about },
        ],
      }
    },
  )

  return server
}

// Where the same mark lives on the web: the image API, which can tint,
// crop and render it, or for an older mark the static file (the image API
// serves current marks only)
function markUrl(
  origin: string,
  source: MarkSource,
  slug: string,
  file: string,
  options: {
    since?: number
    format: 'svg' | 'png'
    color?: string
    size?: number
    crop: boolean
  },
) {
  if (options.since !== undefined) {
    return new URL(
      `/${source}/${slug}/history/${options.since}/${file}.svg`,
      origin,
    ).href
  }
  const url = new URL(
    `/api/${source}/${slug}/${file}.${options.format}`,
    origin,
  )
  if (options.color) url.searchParams.set('color', options.color.slice(1))
  if (options.format === 'png' && options.size) {
    url.searchParams.set('size', String(options.size))
  }
  if (options.crop) url.searchParams.set('viewbox', 'auto')

  return url.href
}
