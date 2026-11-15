import flagIcons from 'flag-icons/country.json'

// The flag file of an ISO 3166-1 alpha-2 code, or of a subdivision such as
// "GB-SCT"; nuxt.config serves them from the flag-icons package
export function countryFlagUrl(iso: string): string {
  return `/flags/${iso.toLowerCase()}.svg`
}

const displayNames = new Intl.DisplayNames(['en'], { type: 'region' })

export function countryName(iso: string): string {
  try {
    return displayNames.of(iso) ?? iso
  } catch {
    return iso
  }
}

// Every ISO 3166-1 country flag-icons has a flag for, by English name
export const COUNTRY_CODES: string[] = flagIcons
  .filter((country) => country.iso)
  .map((country) => country.code.toUpperCase())
  .sort((a, b) => countryName(a).localeCompare(countryName(b)))

// The countries an airline is the flag carrier of: each one in
// `flag_carrier_countries` for a joint flag carrier (Scandinavian Airlines),
// else its own country; none for an airline that isn't a flag carrier
export function flagCarrierCountries(airline: {
  country: string
  flag_carrier?: boolean
  flag_carrier_countries?: readonly string[]
}): readonly string[] {
  if (!airline.flag_carrier) return []

  return airline.flag_carrier_countries ?? [airline.country]
}

const listFormat = new Intl.ListFormat('en', { type: 'conjunction' })

// "Denmark, Norway and Sweden"
export function countryList(codes: readonly string[]): string {
  return listFormat.format(codes.map(countryName))
}
