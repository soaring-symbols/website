// Places outside the npm package where the marks can be used, from raw
// files and data to apps built on them. List only what has shipped; each
// entry offers either a link or a snippet to copy.
export interface EcosystemEntry {
  name: string
  icon: string
  description: string
  link?: { label: string; to: string }
  snippet?: { label: string; code: string }
}

export const ecosystem: EcosystemEntry[] = [
  {
    name: 'jsDelivr CDN',
    icon: 'simple-icons:jsdelivr',
    description:
      'Link any mark straight from the npm package, with nothing to install. The slug is the airline’s name in lowercase with hyphens, like vietnam-airlines; swap logo for icon or tail to get the other marks.',
    snippet: {
      label: 'Copy URL',
      code: 'https://cdn.jsdelivr.net/npm/soaring-symbols/dist/assets/<slug>/logo.svg',
    },
  },
  {
    name: 'JSON API',
    icon: 'hugeicons:api',
    description:
      'Look up an airline and get its codes, callsign, country, hubs, history, brand colors and links to every SVG. End the URL with its IATA code (VN), ICAO code (HVN), slug (vietnam-airlines) or name, in any case; drop it to list them all. Open to any site, no key needed.',
    snippet: {
      label: 'Copy URL',
      code: 'https://soaringsymbols.org/api/airlines/VN',
    },
  },
  {
    name: 'Image API',
    icon: 'hugeicons:image-02',
    description:
      'Load any mark by IATA or ICAO code, as SVG or as PNG for apps that can’t render SVG. Add size for the PNG width (16 to 1024), and give monochrome marks a color, plus a dark one that SVGs switch to in dark mode.',
    snippet: {
      label: 'Copy URL',
      code: 'https://soaringsymbols.org/api/airlines/VN/icon-mono.png?color=fff&size=128',
    },
  },
  {
    name: 'Raycast extension',
    icon: 'simple-icons:raycast',
    description:
      'Search airlines from your launcher, see their codes, callsign, hubs and history, and grab their SVGs. Also works in launchers that run Raycast extensions, such as Vicinae, SuperCmd and Tinycast.',
    link: {
      label: 'Open in Raycast Store',
      to: 'https://www.raycast.com/anhthang/soaring-symbols',
    },
  },
]
