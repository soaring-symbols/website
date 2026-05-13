export function countryFlag(iso: string): string {
    return [...iso.toUpperCase()]
        .map((c) => String.fromCodePoint(c.charCodeAt(0) + 127397))
        .join('')
}

export function countryName(iso: string): string {
    try {
        return new Intl.DisplayNames(['en'], { type: 'region' }).of(iso) ?? iso
    } catch {
        return iso
    }
}
