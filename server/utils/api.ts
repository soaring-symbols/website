import type { Airline, AssetType } from 'soaring-symbols'
import type { H3Event } from 'h3'
import { version } from 'soaring-symbols/package.json'

const ASSET_TYPES: AssetType[] = ['icon', 'logo', 'tail']

export const packageVersion = version

// The package entry as is, plus absolute links to the airline's page and to
// every SVG it ships, keyed like the file names ('logo', 'logo-mono')
export function toApiAirline(airline: Airline, origin: string) {
  const links: Record<string, string> = {
    page: new URL(`/airlines/${airline.slug}`, origin).href,
  }
  for (const type of ASSET_TYPES) {
    const asset = airline.assets[type]
    for (const variant of [
      asset?.color && type,
      asset?.mono && `${type}-mono`,
    ]) {
      if (variant) {
        links[variant] = new URL(
          `/airlines/${airline.slug}/${variant}.svg`,
          origin,
        ).href
      }
    }
  }

  return { ...airline, links }
}

// Readable from any site, and cached for a day: the data only changes with
// a package release, which redeploys the Worker
export function setApiHeaders(event: H3Event) {
  setResponseHeaders(event, {
    'access-control-allow-origin': '*',
    'cache-control': 'public, max-age=3600, s-maxage=86400',
  })
}

export function apiOrigin(event: H3Event) {
  return useRuntimeConfig(event).public.site.homepage
}
