// Places outside the npm package where the marks can be used, from raw
// files and data to apps built on them. A shipped entry offers either a link
// or a snippet to copy; one that hasn't shipped yet carries a status (still
// being built, or waiting for a store's review) and links to its source until
// its store page is public.
//
// The homepage shows each entry as a small tile linking to /ecosystem#<id>;
// the ecosystem page shows the full card, with its details.
export interface EcosystemEntry {
  id: string
  name: string
  icon: string
  group: EcosystemGroup
  description: string
  // Shown on the ecosystem page only: endpoints, parameters, tips
  details?: string[]
  link?: { label: string; to: string }
  snippet?: { label: string; code: string }
  status?: 'In development' | 'In review'
}

export type EcosystemGroup = 'data' | 'apps'

export const ecosystemGroups: {
  id: EcosystemGroup
  title: string
  description: string
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
      'Swap logo for icon or tail, and add -mono before .svg for the monochrome mark.',
      'Older logos are under <slug>/history/<year>/, by the year each came in.',
      'Pin a release line such as soaring-symbols@0.2 for fixes without breaking changes, or an exact release to keep files as they are.',
      'A renamed airline’s old slug keeps working and shows its current marks.',
    ],
    snippet: {
      label: 'Copy URL',
      code: 'https://cdn.jsdelivr.net/npm/soaring-symbols/dist/assets/<slug>/logo.svg',
    },
  },
  {
    id: 'json-api',
    name: 'JSON API',
    icon: 'hugeicons:api',
    group: 'data',
    description:
      'Look up an airline and get its codes, callsign, hubs, brand colors, history and links to every SVG. Open to any site, no key needed.',
    details: [
      '/api/airlines lists every airline, with the package version and a count.',
      '/api/airlines/<code> takes an IATA or ICAO code, a slug or a name, current or former, and returns a 404 with a hint when nothing matches.',
      'A renamed airline lists its former names, and each older logo comes with the years it was used.',
    ],
    snippet: {
      label: 'Copy URL',
      code: 'https://soaringsymbols.org/api/airlines/VN',
    },
  },
  {
    id: 'image-api',
    name: 'Image API',
    icon: 'hugeicons:image-02',
    group: 'data',
    description:
      'Load any mark by IATA or ICAO code, as SVG or as PNG for apps that can’t render SVG, with monochrome marks in the color you pick.',
    details: [
      'The file is logo, icon or tail, with -mono for the monochrome mark, ending in .svg or .png.',
      'color takes a hex color such as fff, and dark the one a monochrome SVG switches to in dark mode.',
      'size sets the PNG width in pixels, from 16 to 1024 (256 by default).',
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
]
