import type { Airline, AssetType, HistoricalMarks } from 'soaring-symbols'
import airlinesData from '#airlines-data'

const airlines = airlinesData as unknown as Airline[]

const bySlug = new Map(airlines.map((a) => [a.slug, a]))
const byName = new Map(airlines.map((a) => [a.name, a]))
const byFormerName = new Map(
  airlines.flatMap((a) => (a.previous_names ?? []).map((name) => [name, a])),
)

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

// The mark types, in the order every page lists them
export const MARK_TYPES = [
  { variant: 'logo', label: 'Logo' },
  { variant: 'icon', label: 'Icon' },
  { variant: 'tail', label: 'Tail' },
] as const

// Whether the package ships a variant, e.g. 'logo' or 'logo-mono'. Every
// single-color mark has a mono file; multi-color ones only when hand-drawn.
// Without `mark` it looks at the current marks; with an entry of
// markHistory(), at that older set.
export function hasAsset(
  airline: Airline,
  variant: string,
  mark?: HistoricalMarks,
) {
  const [type, mono] = variant.split('-') as [AssetType, string?]
  const asset = (mark?.assets ?? airline.assets)[type]

  return Boolean(mono ? asset?.mono : asset?.color)
}

// The first color mark a set ships, e.g. 'logo'; undefined when none
export function firstVariant(airline: Airline, mark?: HistoricalMarks) {
  return MARK_TYPES.find(({ variant }) => hasAsset(airline, variant, mark))
    ?.variant
}

// A file's path inside the package's assets folder, e.g.
// 'korean-air/logo.svg' or 'korean-air/history/1984/logo.svg'. The site,
// jsDelivr and the npm package each put their own root in front.
export function assetPath(
  airline: Airline,
  variant: string,
  mark?: HistoricalMarks,
) {
  const dir = mark ? `${airline.slug}/history/${mark.since}` : airline.slug

  return `${dir}/${variant}.svg`
}

export function assetUrl(
  airline: Airline,
  variant: string,
  mark?: HistoricalMarks,
) {
  return `/airlines/${assetPath(airline, variant, mark)}`
}

export function cdnUrl(
  airline: Airline,
  variant: string,
  mark?: HistoricalMarks,
) {
  return `https://cdn.jsdelivr.net/npm/soaring-symbols/dist/assets/${assetPath(airline, variant, mark)}`
}

// What getAssetPath() returns for the file
export function packagePath(
  airline: Airline,
  variant: string,
  mark?: HistoricalMarks,
) {
  return `soaring-symbols/assets/${assetPath(airline, variant, mark)}`
}

// The name a downloaded file gets, e.g. 'korean-air-1984-logo.svg'
export function downloadName(
  airline: Airline,
  variant: string,
  mark?: HistoricalMarks,
) {
  return [airline.slug, mark?.since, variant].filter(Boolean).join('-') + '.svg'
}

// The heading of an older mark: the years it was used ("2010–2026"), after
// the name on it when that was a former name ("T'way Air · 2010–2026").
// Releases without `until` give the year it came in instead.
export function markHeading(airline: Airline, mark: HistoricalMarks) {
  const years = mark.until
    ? `${mark.since}–${mark.until}`
    : `Introduced ${mark.since}`

  return mark.name && mark.name !== airline.name
    ? `${mark.name} · ${years}`
    : years
}

// Year the current marks came in, set for an airline with older marks
export function currentMarksSince(airline: Airline) {
  return airline.branding?.since
}

// Older marks, newest first. Each was used from its `since` until the next
// one's, and the newest until the current marks
export function markHistory(airline: Airline) {
  return [...(airline.history ?? [])].reverse()
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

// The airline with this name; with `former`, also one that used to be
// called that (T'way Air finds Trinity Airways)
export function airlineByName(
  name?: string | null,
  { former = false } = {},
): Airline | undefined {
  if (!name) return undefined
  return byName.get(name) ?? (former ? byFormerName.get(name) : undefined)
}

export function airlineBySlug(slug?: string) {
  return slug ? bySlug.get(slug) : undefined
}

// The airlines this one owns, e.g. Thai AirAsia under AirAsia: with
// `{ defunct: true }`, the ones that no longer fly under it instead, e.g.
// Jetstar Pacific under Jetstar
export function subsidiariesOf(airline: Airline, { defunct = false } = {}) {
  return (children.get(airline.slug) ?? []).filter(
    (child) => Boolean(child.defunct) === defunct,
  )
}

// The names a renamed airline flew under before, oldest first, e.g.
// ['Hansung Airlines', "T'way Air"] for Trinity Airways
export function previousNames(airline: Airline) {
  return airline.previous_names ?? []
}

// The airline that carried on a defunct one after a merger, a refounding or a
// move out of a group's brand, e.g. Pacific Airlines for Jetstar Pacific
export function successorOf(airline: Airline) {
  return airlineBySlug(airline.successor)
}

// The defunct airlines this one carried on, the earliest to cease first
export function predecessorsOf(airline: Airline) {
  return (airline.predecessors ?? []).flatMap(
    (slug) => airlineBySlug(slug) ?? [],
  )
}

export function cleanUrl(url: string) {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
}

export function useAirlines() {
  return { airlines, stats }
}
