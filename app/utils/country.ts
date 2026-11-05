// Flag files for one country code, or several joined by commas; nuxt.config
// serves them from the flag-icons package
export function countryFlagUrls(iso: string): string[] {
  return iso.split(',').map((code) => `/flags/${code.trim().toLowerCase()}.svg`)
}

const displayNames = new Intl.DisplayNames(['en'], { type: 'region' })

export function countryName(iso: string): string {
  return iso
    .split(',')
    .map((code) => {
      try {
        return displayNames.of(code.trim()) ?? code.trim()
      } catch {
        return code.trim()
      }
    })
    .join(', ')
}
