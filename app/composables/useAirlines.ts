import type {
  Airline,
  Alliance,
  AssetType,
  HistoricalMarks,
} from 'soaring-symbols'
import airlinesData from '#airlines-data'

const airlines = airlinesData as unknown as Airline[]

const bySlug = new Map(airlines.map((a) => [a.slug, a]))
const byName = new Map(airlines.map((a) => [a.name, a]))
const byFormerName = new Map(
  airlines.flatMap((a) => previousNames(a).map((name) => [name, a])),
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

// Where each kind of entry keeps its marks: the site's prefix, the package's
// folder, its mark types in page order, and those whose row asks for a
// contribution when missing. An alliance shows its symbol far more often
// than a logo with its name, so only its icon is asked for.
export const MARK_SOURCES = {
  airlines: {
    site: '/airlines',
    dir: 'assets',
    types: MARK_TYPES,
    asked: ['logo', 'icon', 'tail'],
  },
  alliances: {
    site: '/alliances',
    dir: 'alliances',
    types: [
      { variant: 'icon', label: 'Icon' },
      { variant: 'logo', label: 'Logo' },
    ],
    asked: ['icon'],
  },
} as const

export type MarkSource = keyof typeof MARK_SOURCES
// An airline or an alliance: what the mark helpers below read
type MarkEntry = Pick<Airline | Alliance, 'slug' | 'assets'>

// Whether the package ships a variant, e.g. 'logo' or 'logo-mono'. Every
// single-color mark has a mono file; multi-color ones only when hand-drawn.
// Without `mark` it looks at the current marks; with an entry of
// markHistory(), at that older set.
export function hasAsset(
  entry: MarkEntry,
  variant: string,
  mark?: HistoricalMarks,
) {
  const [type, mono] = variant.split('-') as [AssetType, string?]
  const asset = (mark?.assets ?? (entry.assets as Airline['assets']))[type]

  return Boolean(mono ? asset?.mono : asset?.color)
}

// The first color mark a set ships in the source's order, e.g. 'logo' for
// an airline or 'icon' for an alliance; undefined when none
export function firstVariant(
  entry: MarkEntry,
  mark?: HistoricalMarks,
  source: MarkSource = 'airlines',
) {
  return MARK_SOURCES[source].types.find(({ variant }) =>
    hasAsset(entry, variant, mark),
  )?.variant
}

// A file's path inside the source's folder of the package, e.g.
// 'korean-air/logo.svg' or 'korean-air/history/1984/logo.svg'. The site,
// jsDelivr and the npm package each put their own root in front.
export function assetPath(
  entry: MarkEntry,
  variant: string,
  mark?: HistoricalMarks,
) {
  const dir = mark ? `${entry.slug}/history/${mark.since}` : entry.slug

  return `${dir}/${variant}.svg`
}

export function assetUrl(
  entry: MarkEntry,
  variant: string,
  mark?: HistoricalMarks,
  source: MarkSource = 'airlines',
) {
  return `${MARK_SOURCES[source].site}/${assetPath(entry, variant, mark)}`
}

export function cdnUrl(
  entry: MarkEntry,
  variant: string,
  mark?: HistoricalMarks,
  source: MarkSource = 'airlines',
) {
  return `https://cdn.jsdelivr.net/npm/soaring-symbols/dist/${MARK_SOURCES[source].dir}/${assetPath(entry, variant, mark)}`
}

// What getAssetPath() (or getAllianceAssetPath()) returns for the file
export function packagePath(
  entry: MarkEntry,
  variant: string,
  mark?: HistoricalMarks,
  source: MarkSource = 'airlines',
) {
  return `soaring-symbols/${MARK_SOURCES[source].dir}/${assetPath(entry, variant, mark)}`
}

// The name a downloaded file gets, e.g. 'korean-air-1984-logo.svg'
export function downloadName(
  entry: MarkEntry,
  variant: string,
  mark?: HistoricalMarks,
) {
  return [entry.slug, mark?.since, variant].filter(Boolean).join('-') + '.svg'
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
export function brandColor(airline: Pick<Airline, 'branding'>) {
  const color = airline.branding?.primary_color || '#64748b'

  return color.replace(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i, '#$1$1$2$2$3$3')
}

// A faint wash of the airline's own color, laid over a white tile so logos
// drawn for light backgrounds stay legible in dark mode too
export function brandTint(airline: Pick<Airline, 'branding'>) {
  const tint = `${brandColor(airline)}14`
  return `linear-gradient(${tint}, ${tint})`
}

// A logo tile's wash in the brand's color: a faint tint all over, strongest
// in the top left corner, so the tile reads without a border. For an airline
// or an alliance.
export function brandWash(entry: Pick<Airline, 'branding'>) {
  const color = brandColor(entry)

  return `radial-gradient(circle at 0% 0%, ${color}33, transparent 70%), linear-gradient(${color}0f, ${color}0f)`
}

// "Ceased 2017" for an airline that no longer flies, "Defunct" when the
// year is unknown, and undefined for one still flying
export function ceasedLabel(airline: Airline) {
  if (airline.ceased) return `Ceased ${airline.ceased}`

  return airline.defunct ? 'Defunct' : undefined
}

// "1956", or "1946–2019" for an airline that has ceased operations (or an
// alliance that was disbanded); undefined when neither year is known
export function operatingYears(airline: Pick<Airline, 'founded' | 'ceased'>) {
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

// The names and codes an airline used before, oldest first, each with the
// year it stopped: Jat Airways (ICAO JAT, callsign JAT) until 2013 for Air
// Serbia, or Hawaiian Airlines' own codes before it took Alaska's
export function formerIdentities(airline: Airline) {
  return airline.former ?? []
}

// The names a renamed airline flew under before, oldest first, e.g.
// ['Hansung Airlines', "T'way Air"] for Trinity Airways
export function previousNames(airline: Airline) {
  return formerIdentities(airline).flatMap(({ name }) => (name ? [name] : []))
}

// Whether a search matches one of the codes or callsigns an airline used
// before, the way it matches the current ones
export function matchesFormerCode(airline: Airline, q: string) {
  return formerIdentities(airline).some(
    (item) =>
      item.iata?.toLowerCase().startsWith(q) ||
      item.icao?.toLowerCase().startsWith(q) ||
      item.callsign?.toLowerCase().includes(q),
  )
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
