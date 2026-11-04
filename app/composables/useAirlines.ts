import type { AirlineMeta } from '~/types/airline'
import airlinesData from '#airlines-data'
import airlineAssets from '#airline-assets'

const airlines = airlinesData as unknown as AirlineMeta[]

const stats = {
  total: airlines.length,
  countries: new Set(airlines.flatMap((a) => a.country.split(','))).size,
  alliances: new Set(airlines.filter((a) => a.alliance).map((a) => a.alliance))
    .size,
}

export function hasAsset(airline: AirlineMeta, variant: string) {
  return airlineAssets[airline.slug]?.includes(variant) ?? false
}

export function assetUrl(airline: AirlineMeta, variant: string) {
  return `/airlines/${airline.slug}/${variant}.svg`
}

// Always six hex digits, so callers can append an alpha channel: a short
// #rgb plus '14' would read as an invalid five-digit color
export function brandColor(airline: AirlineMeta) {
  const color = airline.branding?.primary_color || '#64748b'

  return color.replace(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i, '#$1$1$2$2$3$3')
}

// A faint wash of the airline's own color, laid over a white tile so logos
// drawn for light backgrounds stay legible in dark mode too
export function brandTint(airline: AirlineMeta) {
  const tint = `${brandColor(airline)}14`
  return `linear-gradient(${tint}, ${tint})`
}

export function cleanUrl(url: string) {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
}

export function useAirlines() {
  return { airlines, stats }
}
