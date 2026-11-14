import type { Airline, Alliance } from 'soaring-symbols'
import alliancesData from '#alliances-data'
import { assetUrl, cdnUrl, firstVariant } from './useAirlines'

// Every alliance an airline may name in `alliance`, sorted by name, from
// soaring-symbols 0.4.0: those without marks yet are listed too, with empty
// `assets`
const alliances = alliancesData as unknown as Alliance[]

const byName = new Map(alliances.map((a) => [a.name, a]))
const bySlug = new Map(alliances.map((a) => [a.slug, a]))

export function allianceByName(name?: string | null) {
  return name ? byName.get(name) : undefined
}

export function allianceBySlug(slug?: string) {
  return slug ? bySlug.get(slug) : undefined
}

// The mark to show for an alliance, its icon before its logo; undefined
// while the collection has neither
export function allianceMark(alliance?: Alliance) {
  return alliance ? firstVariant(alliance, undefined, 'alliances') : undefined
}

// An alliance file's URL on the site and on jsDelivr, e.g.
// '/alliances/skyteam/icon.svg'
export function allianceAssetUrl(alliance: Alliance, variant: string) {
  return assetUrl(alliance, variant, undefined, 'alliances')
}

export function allianceCdnUrl(alliance: Alliance, variant: string) {
  return cdnUrl(alliance, variant, undefined, 'alliances')
}

// "Disbanded 2023", "Disbanded" when the year is unknown, and undefined for
// an alliance still active
export function disbandedLabel(alliance: Alliance) {
  if (alliance.ceased) return `Disbanded ${alliance.ceased}`

  return alliance.defunct ? 'Disbanded' : undefined
}

// The airlines that name the alliance as theirs, in catalog (name) order:
// the members still flying, or with `{ defunct: true }` those that were
// members when they ceased. Affiliates flying under a member's membership
// name none, so they aren't listed.
export function membersOf(
  alliance: Alliance,
  airlines: Airline[],
  { defunct = false } = {},
) {
  return airlines.filter(
    (airline) =>
      airline.alliance === alliance.name &&
      Boolean(airline.defunct) === defunct,
  )
}

// The airlines that left the alliance, from their `alliance_history`, with
// the years each joined and left, the latest to leave first
export function formerMembersOf(alliance: Alliance, airlines: Airline[]) {
  return airlines
    .flatMap((airline) =>
      (airline.alliance_history ?? [])
        .filter((item) => item.alliance === alliance.name)
        .map((item) => ({ airline, since: item.since, until: item.until })),
    )
    .sort((a, b) => b.until - a.until)
}

// The alliance's airlines in the collection, for its card and its page:
// those flying in it now, or for a disbanded alliance those that flew in it
// (members when they ceased, then those that left)
export function collectionAirlines(alliance: Alliance, airlines: Airline[]) {
  const flying = membersOf(alliance, airlines)
  if (flying.length || !alliance.defunct) return flying

  return [
    ...membersOf(alliance, airlines, { defunct: true }),
    ...formerMembersOf(alliance, airlines).map(({ airline }) => airline),
  ]
}

// How many those are, never the alliance's own member count, which the
// collection doesn't track: "14 airlines in the collection", or "1 airline
// in the collection flew in it" for a disbanded alliance
export function collectionCount(alliance: Alliance, airlines: Airline[]) {
  const n = collectionAirlines(alliance, airlines).length
  const airlinesIn = `${n} airline${n === 1 ? '' : 's'} in the collection`

  return alliance.defunct && n ? `${airlinesIn} flew in it` : airlinesIn
}

export function useAlliances() {
  return { alliances }
}
