import type { Airline, Alliance } from 'soaring-symbols'
import type { H3Event } from 'h3'
import { version } from 'soaring-symbols/package.json'
import { MARK_TYPES, type MarkSource } from './images'

export const packageVersion = version

// The package entry as is, plus absolute links to its page and to every SVG
// it ships, keyed like the file names ('logo', 'logo-mono', 'logo-dark'): an airline's
// under /airlines, an alliance's under /alliances
function withLinks<T extends Airline | Alliance>(
  entry: T,
  source: MarkSource,
  origin: string,
) {
  const links: Record<string, string> = {
    page: new URL(`/${source}/${entry.slug}`, origin).href,
  }
  for (const type of MARK_TYPES[source]) {
    const asset = (entry.assets as Airline['assets'])[type]
    for (const variant of [
      asset?.color && type,
      asset?.mono && `${type}-mono`,
      asset?.dark && `${type}-dark`,
    ]) {
      if (variant) {
        links[variant] = new URL(
          `/${source}/${entry.slug}/${variant}.svg`,
          origin,
        ).href
      }
    }
  }

  return { ...entry, links }
}

export const toApiAirline = (airline: Airline, origin: string) =>
  withLinks(airline, 'airlines', origin)

export const toApiAlliance = (alliance: Alliance, origin: string) =>
  withLinks(alliance, 'alliances', origin)

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
