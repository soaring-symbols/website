import type { Airline, Alliance } from 'soaring-symbols'
import alliancesData from '#alliances-data'

// Every alliance an airline may name in `alliance`, sorted by name, from
// soaring-symbols 0.4.0: those without marks yet are listed too, with empty
// `assets`
const alliances = alliancesData as unknown as Alliance[]

const byName = new Map(alliances.map((a) => [a.name, a]))
const bySlug = new Map(alliances.map((a) => [a.slug, a]))

// An alliance's marks, the icon first: alliances show their symbol far more
// often than a logo with their name
export const ALLIANCE_MARK_TYPES = [
  { variant: 'icon', label: 'Icon' },
  { variant: 'logo', label: 'Logo' },
] as const

export function allianceByName(name?: string | null) {
  return name ? byName.get(name) : undefined
}

export function allianceBySlug(slug?: string) {
  return slug ? bySlug.get(slug) : undefined
}

// Whether the package ships a variant of the alliance's marks, e.g. 'icon'
// or 'icon-mono'
export function hasAllianceAsset(alliance: Alliance, variant: string) {
  const [type, mono] = variant.split('-') as ['icon' | 'logo', string?]
  const asset = alliance.assets[type]

  return Boolean(mono ? asset?.mono : asset?.color)
}

// The mark to show for an alliance, its icon before its logo; undefined
// while the collection has neither
export function allianceMark(alliance?: Alliance) {
  if (!alliance) return undefined

  return ALLIANCE_MARK_TYPES.find(({ variant }) =>
    hasAllianceAsset(alliance, variant),
  )?.variant
}

// A file's path inside the package's alliances folder, e.g.
// 'skyteam/icon.svg'; the site, jsDelivr and the npm package each put their
// own root in front
export function allianceAssetPath(alliance: Alliance, variant: string) {
  return `${alliance.slug}/${variant}.svg`
}

export function allianceAssetUrl(alliance: Alliance, variant: string) {
  return `/alliances/${allianceAssetPath(alliance, variant)}`
}

export function allianceCdnUrl(alliance: Alliance, variant: string) {
  return `https://cdn.jsdelivr.net/npm/soaring-symbols/dist/alliances/${allianceAssetPath(alliance, variant)}`
}

// "1997", or "2016–2023" for an alliance that was disbanded; undefined
// when neither year is known
export function allianceYears(alliance: Alliance) {
  const { founded, ceased } = alliance
  if (ceased) return `${founded ?? '?'}–${ceased}`

  return founded ? String(founded) : undefined
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

export function useAlliances() {
  return { alliances }
}
