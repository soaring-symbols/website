// Mirrors the Airline type of the soaring-symbols package
export interface AirlineBranding {
  primary_color?: string
  tagline?: string
  guidelines?: string
  /** Releases before `assets` existed: colors per type with a color file */
  colors?: {
    icon?: readonly string[]
    logo?: readonly string[]
    tail?: readonly string[]
  }
}

export interface AssetInfo {
  color: boolean
  mono: boolean
  colors: readonly string[]
}

export interface AirlineMeta {
  name: string
  iata: string
  icao: string
  country: string
  flag_carrier?: boolean
  website?: string
  alliance?: string
  slug: string
  branding?: AirlineBranding
  /** Missing in releases before 0.1.0-alpha.15 */
  assets?: {
    icon?: AssetInfo
    logo?: AssetInfo
    tail?: AssetInfo
  }
}
