export function countryFlag(iso: string): string {
  return iso
    .split(',')
    .map((code) =>
      [...code.trim().toUpperCase()]
        .map((c) => String.fromCodePoint(c.charCodeAt(0) + 127397))
        .join(''),
    )
    .join(' ')
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
