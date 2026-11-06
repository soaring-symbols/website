import type { Airline, AssetType } from 'soaring-symbols'
import airlinesData from '#airlines-data'

const airlines = airlinesData as unknown as Airline[]

const bySlug = new Map(airlines.map((a) => [a.slug, a]))

// Airlines owned by each parent, in catalog (name) order
const children = new Map<string, Airline[]>()
for (const airline of airlines) {
  if (!airline.parent) continue
  children.set(airline.parent, [
    ...(children.get(airline.parent) ?? []),
    airline,
  ])
}

const stats = {
  total: airlines.length,
  countries: new Set(airlines.flatMap((a) => a.country.split(','))).size,
  alliances: new Set(airlines.filter((a) => a.alliance).map((a) => a.alliance))
    .size,
}

// Whether the package ships a variant, e.g. 'logo' or 'logo-mono'. Every
// single-color mark has a mono file; multi-color ones only when hand-drawn.
export function hasAsset(airline: Airline, variant: string) {
  const [type, mono] = variant.split('-') as [AssetType, string?]
  const asset = airline.assets[type]

  return Boolean(mono ? asset?.mono : asset?.color)
}

export function assetUrl(airline: Airline, variant: string) {
  return `/airlines/${airline.slug}/${variant}.svg`
}

// Always six hex digits, so callers can append an alpha channel: a short
// #rgb plus '14' would read as an invalid five-digit color
export function brandColor(airline: Airline) {
  const color = airline.branding?.primary_color || '#64748b'

  return color.replace(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i, '#$1$1$2$2$3$3')
}

// A faint wash of the airline's own color, laid over a white tile so logos
// drawn for light backgrounds stay legible in dark mode too
export function brandTint(airline: Airline) {
  const tint = `${brandColor(airline)}14`
  return `linear-gradient(${tint}, ${tint})`
}

// "Ceased 2017" for an airline that no longer flies, "Defunct" when the
// year is unknown, and undefined for one still flying
export function ceasedLabel(airline: Airline) {
  if (airline.ceased) return `Ceased ${airline.ceased}`

  return airline.defunct ? 'Defunct' : undefined
}

// "1956", or "1946–2019" for an airline that has ceased operations;
// undefined when neither year is known
export function operatingYears(airline: Airline) {
  const { founded, ceased } = airline
  if (ceased) return `${founded ?? '?'}–${ceased}`

  return founded ? String(founded) : undefined
}

export function airlineBySlug(slug?: string) {
  return slug ? bySlug.get(slug) : undefined
}

// The airlines this one owns, e.g. Thai AirAsia under AirAsia
export function subsidiariesOf(airline: Airline) {
  return children.get(airline.slug) ?? []
}

export function cleanUrl(url: string) {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
}

export function useAirlines() {
  return { airlines, stats }
}
