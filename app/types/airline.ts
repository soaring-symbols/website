// Mirrors the Airline type of the soaring-symbols package
export interface AirlineBranding {
  primary_color?: string
  tagline?: string
  guidelines?: string
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
  assets: {
    icon?: AssetInfo
    logo?: AssetInfo
    tail?: AssetInfo
  }
}
