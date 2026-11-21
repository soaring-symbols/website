// The Soaring Symbols mark, as the brand repo draws it. The SVGs in
// public/brand/ are copies of its marks/, under the same names: change them
// there, then copy them here
export const BRAND_REPO_URL = 'https://github.com/soaring-symbols/brand'

export type BrandFileKind = 'color' | 'mono' | 'dark'

export interface BrandRow {
  id: string
  label: string
  description: string
  files: Record<BrandFileKind, string>
}

export const brandRows: BrandRow[] = [
  {
    id: 'logo',
    label: 'Logo',
    description: 'The name beside the mark. The first choice wherever it fits.',
    files: {
      color: 'logo.svg',
      mono: 'logo-mono.svg',
      dark: 'logo-dark.svg',
    },
  },
  {
    id: 'logo-stacked',
    label: 'Stacked logo',
    description: 'The name under the mark, for square and narrow spaces.',
    files: {
      color: 'logo-stacked.svg',
      mono: 'logo-stacked-mono.svg',
      dark: 'logo-stacked-dark.svg',
    },
  },
  {
    id: 'icon',
    label: 'Icon',
    description:
      'The mark alone, for avatars and app icons. The monochrome one drops the hinge, so it holds at 16 pixels.',
    files: {
      color: 'icon.svg',
      mono: 'icon-mono.svg',
      dark: 'icon-dark.svg',
    },
  },
]

export const BRAND_KIND_LABELS: Record<BrandFileKind, string> = {
  color: 'Color',
  mono: 'Monochrome',
  dark: 'Dark background',
}

export interface BrandColor {
  name: string
  hex: string
  use: string
  // A light swatch needs a border to stand out from the page
  light?: boolean
}

export const brandColors: BrandColor[] = [
  {
    name: 'Signal',
    hex: '#ffc20e',
    use: 'The one accent: the letters on dark',
  },
  { name: 'Board', hex: '#1f242b', use: 'The name, and dark backgrounds' },
  { name: 'Flap top', hex: '#2b3139', use: 'Upper half of a tile' },
  { name: 'Flap bottom', hex: '#262b32', use: 'Lower half of a tile' },
  {
    name: 'Dark flap top',
    hex: '#3a424d',
    use: 'Upper half of a tile on dark',
  },
  {
    name: 'Dark flap bottom',
    hex: '#343b45',
    use: 'Lower half of a tile on dark',
  },
  { name: 'Hinge', hex: '#13161a', use: 'The line across a tile' },
  {
    name: 'Paper',
    hex: '#ecebe4',
    use: 'Letters, and the name on dark',
    light: true,
  },
]
