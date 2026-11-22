import { version } from 'soaring-symbols/package.json'

// The release line of the package the site is built with, e.g. '0.5' for
// 0.5.2: each minor release is a new line, so the copy follows the
// dependency instead of being edited on every minor release
const RELEASE_LINE = version.split('.').slice(0, 2).join('.')

// Places outside the npm package where the marks can be used, from raw
// files and data to apps built on them. A shipped entry offers a link, a
// one-line snippet to copy, or both; one that hasn't shipped yet carries a
// status (still being built, or waiting for a store's review) and links to
// its source until its store page is public.
//
// The homepage shows each entry as a small tile linking to /ecosystem#<id>.
// The ecosystem page gives every entry, in either group, the same row: its
// name and main action on one line, its description under it, then its
// snippet, details and examples, if any. A new entry only fills in these
// fields; the page lays it out.
export interface EcosystemEntry {
  id: string
  name: string
  // Who made it, for an entry made by someone outside the project, which
  // makes it a community entry; the project's own entries leave it out
  author?: { name: string; to: string }
  icon: string
  group: EcosystemGroup
  // A sentence or two on what it is and what it does
  description: string
  // Each path, parameter, option or feature (term) with what it does, in a
  // sentence
  details?: EcosystemDetail[]
  // Longer code to copy, such as a config to paste into another app, in
  // tabs when there's more than one way to set it up
  examples?: EcosystemExample[]
  link?: { label: string; to: string }
  // One line, such as a URL
  snippet?: { label: string; code: string }
  status?: 'In development' | 'In review'
}

export interface EcosystemDetail {
  term: string
  text: string
}

// One tab of examples: each item a block of code with a label above it
export interface EcosystemExample {
  id: string
  label: string
  items: { label: string; code: string }[]
}

export type EcosystemGroup = 'data' | 'apps'

// Each group lists its entries in the order written below, or by name,
// so a long list needs no place picked for each new entry
export const ecosystemGroups: {
  id: EcosystemGroup
  title: string
  description: string
  sortByName?: boolean
}[] = [
  {
    id: 'data',
    title: 'Files and APIs',
    description:
      'Load the marks and airline data over the web, from any language or app, with no key and nothing to install.',
  },
  {
    id: 'apps',
    title: 'Apps and plugins',
    description:
      'Find an airline and grab its marks without leaving the tools you work in.',
    sortByName: true,
  },
]

export const ecosystem: EcosystemEntry[] = [
  {
    id: 'jsdelivr',
    name: 'jsDelivr CDN',
    icon: 'simple-icons:jsdelivr',
    group: 'data',
    description:
      'Link any mark straight from the npm package, with nothing to install. The slug is the airline’s name in lowercase with hyphens, like vietnam-airlines.',
    details: [
      {
        term: 'icon, tail, logo-stacked',
        text: 'The other marks, in place of logo; logo-stacked is the vertical lockup, for airlines that have one.',
      },
      {
        term: '-mono, -dark',
        text: 'Before .svg: the monochrome mark, or the one for dark backgrounds.',
      },
      {
        term: '<slug>/history/<year>/',
        text: 'Older logos, by the year each came in.',
      },
      {
        term: `soaring-symbols@${RELEASE_LINE}`,
        text: 'A release line, for fixes without breaking changes; pin an exact release to keep files as they are.',
      },
      {
        term: '<old slug>/',
        text: 'A renamed airline’s old slug shows its current marks.',
      },
    ],
    snippet: {
      label: 'Copy URL',
      code: 'https://cdn.jsdelivr.net/npm/soaring-symbols/dist/assets/<slug>/logo.svg',
    },
  },
  {
    id: 'unpkg',
    name: 'unpkg CDN',
    icon: 'simple-icons:unpkg',
    group: 'data',
    description:
      'The same files from the npm package on another CDN, at the same paths, so either one can stand in for the other.',
    details: [
      {
        term: `soaring-symbols@${RELEASE_LINE}`,
        text: 'Redirects to the newest release in the line within minutes of publishing.',
      },
      {
        term: 'dist/index.js',
        text: 'The library as an ES module, for pages without a bundler.',
      },
      {
        term: '?module',
        text: 'Imports the SVG fixer, which then loads its resvg dependency from unpkg too.',
      },
    ],
    snippet: {
      label: 'Copy URL',
      code: 'https://unpkg.com/soaring-symbols/dist/assets/<slug>/logo.svg',
    },
  },
  {
    id: 'json-api',
    name: 'JSON API',
    icon: 'simple-icons:json',
    group: 'data',
    description:
      'Look up an airline and get its codes, callsign, hubs, brand colors, history and links to every SVG, or an alliance and its marks. Open to any site, no key needed.',
    details: [
      {
        term: '/api/airlines',
        text: 'Every airline, with the package version and a count.',
      },
      {
        term: '?code=<code>',
        text: 'Every airline holding an IATA or ICAO code, such as SL for Thai Lion Air and SAS Connect; add &former=true for those that held it before.',
      },
      {
        term: '?cargo=true',
        text: 'Only the cargo airlines and the cargo brands of passenger airlines, such as Cargolux; cargo=false leaves them out. Works with ?code= too.',
      },
      {
        term: '/api/airlines/<code>',
        text: 'One airline by IATA or ICAO code, slug or name, current or former, or another name it goes by (SWISS); a 404 with a hint when nothing matches.',
      },
      {
        term: 'former, history',
        text: 'A renamed airline’s former names, and the years each older logo was used.',
      },
      {
        term: '/api/alliances',
        text: 'Every alliance; /api/alliances/<name> takes a name or slug, such as skyteam, with its slogan, years, color and marks.',
      },
    ],
    snippet: {
      label: 'Copy URL',
      code: 'https://soaringsymbols.org/api/airlines/VN',
    },
  },
  {
    id: 'image-api',
    name: 'Image API',
    icon: 'simple-icons:svg',
    group: 'data',
    description:
      'Load any airline’s mark by IATA or ICAO code, or an alliance’s by name, as SVG or as PNG for apps that can’t render SVG, with monochrome marks in the color you pick.',
    details: [
      {
        term: '<file>',
        text: 'logo, logo-stacked, icon or tail, with -mono for the monochrome mark or -dark for dark backgrounds, ending in .svg or .png.',
      },
      {
        term: '?color=',
        text: 'A hex color for a monochrome mark, such as fff.',
      },
      {
        term: '?dark=',
        text: 'The color a monochrome SVG switches to in dark mode.',
      },
      {
        term: '?size=',
        text: 'The PNG width in pixels, from 16 to 1024 (256 by default).',
      },
      {
        term: '?viewbox=auto',
        text: 'Crops the square canvas to the drawing, so a horizontal logo fills a wide box instead of a square with space above and below.',
      },
      {
        term: '/api/alliances/<slug>/',
        text: 'Alliance marks, the same way, with icon and logo files.',
      },
    ],
    snippet: {
      label: 'Copy URL',
      code: 'https://soaringsymbols.org/api/airlines/VN/icon-mono.png?color=fff&size=128',
    },
  },
  {
    id: 'raycast',
    name: 'Raycast extension',
    icon: 'simple-icons:raycast',
    group: 'apps',
    description:
      'Search airlines from your launcher, see their codes, hubs and history, and grab their SVGs, earlier logos included. Also works in Vicinae, SuperCmd and Tinycast, which run Raycast extensions.',
    link: {
      label: 'Open in Raycast Store',
      to: 'https://www.raycast.com/anhthang/soaring-symbols',
    },
  },
  {
    id: 'figma',
    name: 'Figma plugin',
    icon: 'simple-icons:figma',
    group: 'apps',
    description:
      'Search airlines by name or code in Figma or FigJam, and click or drag their marks onto the canvas as vector layers, earlier logos included, with monochrome marks in any color.',
    status: 'In review',
    link: {
      label: 'View on GitHub',
      to: 'https://github.com/soaring-symbols/figma',
    },
  },
  {
    id: 'drawio',
    name: 'draw.io libraries',
    icon: 'simple-icons:diagramsdotnet',
    group: 'apps',
    description:
      'Open every airline’s icons, logos and tails, and the alliance marks, as libraries in draw.io (diagrams.net), find an airline by name or code in its shape search, and recolor the monochrome marks for light and dark diagrams.',
    link: { label: 'Open in draw.io', to: drawioUrl() },
  },
  {
    id: 'home-assistant',
    name: 'Home Assistant',
    author: { name: 'Springvar', to: 'https://github.com/Springvar' },
    icon: 'simple-icons:homeassistant',
    group: 'apps',
    description:
      'Show each flight’s airline beside it in the Flightradar24 card, loaded from the image API by the flight’s ICAO code: paste one of these into the card’s YAML. A flight with no airline, or one whose airline lacks the mark, shows nothing rather than a broken image.',
    details: [
      {
        term: 'templates',
        text: 'The card’s own option for its HTML.',
      },
      {
        term: 'airline_logo',
        text: 'A new template holding the mark.',
      },
      {
        term: 'header',
        text: 'The card’s template for a flight’s first line, redefined to put the mark before the flight’s name.',
      },
    ],
    // The card's templates are JavaScript template literals, so
    // ${flight.airline_icao} is filled in by the card, not here
    examples: [
      {
        // A missing icon is a 404: onerror swaps in the logo, then drops the
        // image if that is missing too. viewbox=auto crops each mark to its
        // drawing, so a logo fills the 24px height; size is the PNG's
        // width, so 192 keeps a wide mark sharp, and object-fit keeps one
        // wider than 4:1 in shape
        id: 'color',
        label: 'Icon or logo',
        items: [
          {
            label: 'In color, with the logo for an airline without an icon',
            code: haCard([
              '<img style="float: left; height: 24px; max-width: 96px; margin-right: 5px; object-fit: contain;"',
              `src="${haMark('icon.png?size=192&viewbox=auto')}"`,
              `onerror="this.onerror = () => this.remove(); this.src = '${haMark('logo.png?size=192&viewbox=auto')}'" />`,
            ]),
          },
        ],
      },
      {
        // The monochrome SVG as a CSS mask over the text color: a mask has
        // no onerror, so an airline without one leaves a blank space
        id: 'mono',
        label: 'Monochrome',
        items: [
          {
            label: 'In the card’s text color, following the theme',
            code: haCard([
              '<span style="float: left; width: 24px; height: 24px; margin-right: 5px;',
              'background-color: currentColor;',
              `-webkit-mask: url(${haMark('icon-mono.svg')}) center / contain no-repeat;`,
              `mask: url(${haMark('icon-mono.svg')}) center / contain no-repeat;"></span>`,
            ]),
          },
        ],
      },
    ],
    link: {
      label: 'View on GitHub',
      to: 'https://github.com/Springvar/home-assistant-flightradar24-card',
    },
  },
]

// One group's entries in the order the pages show them (see
// ecosystemGroups): files and APIs as listed above, simplest first; apps by
// name, easy to scan in a long list
export function ecosystemEntries(group: EcosystemGroup) {
  const entries = ecosystem.filter((entry) => entry.group === group)
  if (!ecosystemGroups.find((g) => g.id === group)?.sortByName) return entries

  return entries.sort((a, b) =>
    a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }),
  )
}

// A file from the image API for the Home Assistant examples, with the
// card's own ${flight.airline_icao} left in for it to fill
function haMark(file: string) {
  return `https://soaringsymbols.org/api/airlines/\${flight.airline_icao}/${file}`
}

// The Flightradar24 card's YAML around an airline_logo template
function haCard(logo: string[]) {
  return [
    'type: custom:flightradar24-radar-card',
    'templates:',
    '  airline_logo: >-',
    ...logo.map((line) => `    ${line}`),
    '  header: <div>${tpl.airline_logo}${tpl.flight_info_element}</div>',
  ].join('\n')
}

// app.diagrams.net with the four color libraries open, from the release line
// of @soaring-symbols/drawio, which shares the package's version
function drawioUrl() {
  const libraries = ['icons', 'logos', 'tails', 'alliances'].map(
    (name) =>
      `Uhttps://cdn.jsdelivr.net/npm/@soaring-symbols/drawio@${RELEASE_LINE}/dist/${name}.xml`,
  )

  return `https://app.diagrams.net/?clibs=${libraries.join(';')}`
}
