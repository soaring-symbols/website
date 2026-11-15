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

const listFormat = new Intl.ListFormat('en', { type: 'conjunction' })

// "Denmark, Norway and Sweden"
export function countryList(codes: readonly string[]): string {
  return listFormat.format(codes.map(countryName))
}
