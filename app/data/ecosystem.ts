// Places outside the npm package where the marks can be used. List only
// what has shipped; each entry offers either a link or a snippet to copy.
export interface EcosystemEntry {
  name: string
  icon: string
  description: string
  link?: { label: string; to: string }
  snippet?: { label: string; code: string }
}

export const ecosystem: EcosystemEntry[] = [
  {
    name: 'Raycast extension',
    icon: 'simple-icons:raycast',
    description:
      'Search airlines from your launcher, see their codes, country and website, and grab their SVGs.',
    link: {
      label: 'Open in Raycast Store',
      to: 'https://www.raycast.com/anhthang/soaring-symbols',
    },
  },
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
]
