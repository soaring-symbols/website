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
      'Link any mark straight from the npm package, with nothing to install. The slug is the airline’s name in lowercase with hyphens, like vietnam-airlines; swap logo for icon or tail to get the other marks.',
    details: [
      'Pin a release line, such as soaring-symbols@0.2, to get new airlines and fixes without breaking changes.',
      'Add -mono before .svg for the monochrome mark, where the airline has one.',
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
      'Look up an airline and get its codes, callsign, country, hubs, history, brand colors and links to every SVG. End the URL with its IATA code (VN), ICAO code (HVN), slug (vietnam-airlines) or name, in any case; drop it to list them all. Open to any site, no key needed.',
    details: [
      '/api/airlines lists every airline, with the package version and a count.',
      '/api/airlines/<code> returns one airline, or a 404 with a hint when nothing matches.',
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
      'Load any mark by IATA or ICAO code, as SVG or as PNG for apps that can’t render SVG. Add size for the PNG width (16 to 1024), and give monochrome marks a color, plus a dark one that SVGs switch to in dark mode.',
    details: [
      'The file is logo, icon or tail, with -mono for the monochrome mark, ending in .svg or .png.',
      'color takes a hex color such as fff or 00ccff, for monochrome marks only.',
      'dark sets the color a monochrome SVG switches to when the viewer is in dark mode.',
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
      'Search airlines from your launcher, see their codes, callsign, hubs and history, and grab their SVGs. Also works in launchers that run Raycast extensions, such as Vicinae, SuperCmd and Tinycast.',
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
      'Search airlines by name, IATA or ICAO code in Figma or FigJam, and click or drag their marks onto the canvas as vector layers, in the size you need and monochrome marks in any color.',
    status: 'In review',
    link: {
      label: 'View on GitHub',
      to: 'https://github.com/soaring-symbols/figma',
    },
  },
]
