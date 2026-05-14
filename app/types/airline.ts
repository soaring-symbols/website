export interface AirlineBranding {
  primary_color?: string
  tagline?: string
  guidelines?: string
  colors: {
    icon?: readonly string[]
    logo?: readonly string[]
    tail?: readonly string[]
  }
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
}
