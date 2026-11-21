import { version } from 'soaring-symbols/package.json'

// The release line of the package the site is built with, e.g. '0.5' for
// 0.5.2: each minor release is a new line, so the copy follows the
// dependency instead of being edited on every minor release
const RELEASE_LINE = version.split('.').slice(0, 2).join('.')

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
  // Shown on the ecosystem page only, folded away until opened: each path,
  // parameter or option (term) with what it does, in a sentence
  details?: EcosystemDetail[]
  link?: { label: string; to: string }
  snippet?: { label: string; code: string }
  status?: 'In development' | 'In review'
}

export interface EcosystemDetail {
  term: string
  text: string
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
]
