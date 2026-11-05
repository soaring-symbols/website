// Iconify names of the flags for one country code, or several joined by
// commas; the set is bundled in nuxt.config so no flag loads at runtime
export function countryFlagIcons(iso: string): string[] {
  return iso.split(',').map((code) => `flag:${code.trim().toLowerCase()}-4x3`)
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
