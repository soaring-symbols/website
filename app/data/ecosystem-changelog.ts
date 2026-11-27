// What changed around the package, for the changelog's Ecosystem tab: the
// website and its API, the CDNs and the apps. The package's own releases come
// from GitHub (useReleases); these happen on each app's schedule, so each is
// dated by when users could have it (deployed, or published on its store,
// not while in review) rather than by a package version.
//
// Only what users notice: a new app, or a feature in one, never small fixes
// or polish. Newest first, one entry per app and change; `app` is an
// ecosystem entry's id (app/data/ecosystem.ts), such as 'json-api' or
// 'image-api' for the website's APIs, or 'website' for its pages. A change
// that reaches both gets an entry for each. Text in backticks shows as code.
import { ecosystem } from './ecosystem'

interface EcosystemChange {
  date: string
  app: string
  text: string
}

const changes: EcosystemChange[] = [
  {
    date: '2026-11-27',
    app: 'miro',
    text: 'Out now: search airlines on a Miro board and click or drag their marks onto it. Install it from its link on the ecosystem page.',
  },
  {
    date: '2026-11-27',
    app: 'mcp',
    text: 'Out now: AI assistants such as Claude, Cursor and VS Code search airlines and fetch their marks as SVG or PNG. Add `https://soaringsymbols.org/mcp` to any MCP client.',
  },
  {
    date: '2026-11-26',
    app: 'webflow',
    text: 'Out now: search airlines in the Webflow Designer and insert their marks as images with alt text. Add it to your workspace as a private app.',
  },
  {
    date: '2026-11-25',
    app: 'framer',
    text: 'Out on the Framer Marketplace: search airlines by name or code and drop their marks into Framer as SVG layers.',
  },
  {
    date: '2026-11-21',
    app: 'website',
    text: 'The validate page compares two SVGs by shape alone, and zooms into previews with a pinch or drag.',
  },
  {
    date: '2026-11-20',
    app: 'website',
    text: 'The validate page flags near misses with the commands that fix them.',
  },
  {
    date: '2026-11-20',
    app: 'raycast',
    text: 'Cargo airlines are marked "Cargo", and searching "cargo" lists them.',
  },
  {
    date: '2026-11-18',
    app: 'website',
    text: 'A passenger or cargo filter, and a "Cargo" badge on cargo airlines.',
  },
  {
    date: '2026-11-18',
    app: 'json-api',
    text: '`?cargo=true` or `?cargo=false` lists only cargo or passenger airlines.',
  },
  {
    date: '2026-11-15',
    app: 'raycast',
    text: 'Browse alliances and their airlines, and see every country of a joint flag carrier.',
  },
  {
    date: '2026-11-15',
    app: 'website',
    text: 'Filter by any country, with flag carriers marked on airline pages.',
  },
  {
    date: '2026-11-14',
    app: 'json-api',
    text: 'Alliances at `/api/alliances` and `/api/alliances/skyteam`, and `?code=` lists every airline holding a code, like `/api/airlines?code=SL`.',
  },
  {
    date: '2026-11-14',
    app: 'image-api',
    text: 'Alliance marks by name, like `/api/alliances/skyteam/icon.png`.',
  },
  {
    date: '2026-11-14',
    app: 'website',
    text: 'A page per alliance, with its marks and the airlines that fly in it.',
  },
  {
    date: '2026-11-13',
    app: 'website',
    text: "Airline pages gain a history section and a globe of the airline's hubs, and this changelog page arrives.",
  },
  {
    date: '2026-11-12',
    app: 'unpkg',
    text: 'unpkg joins jsDelivr as a CDN for the marks and the library.',
  },
  {
    date: '2026-11-07',
    app: 'image-api',
    text: 'Out now: any mark as SVG or PNG by code, like `/api/airlines/VN/logo.svg`, with monochrome marks in any color.',
  },
  {
    date: '2026-11-07',
    app: 'website',
    text: 'An ecosystem page listing every integration.',
  },
  {
    date: '2026-11-05',
    app: 'json-api',
    text: 'Out now: every airline at `/api/airlines`, or one by code, slug or name at `/api/airlines/VN`.',
  },
  {
    date: '2026-11-04',
    app: 'website',
    text: 'Out now at soaringsymbols.org: browse and search the collection, with a page per airline and an SVG validator.',
  },
  {
    date: '2026-06-03',
    app: 'raycast',
    text: 'Out on the Raycast Store: browse and search the logos, icons and tails from Raycast.',
  },
]

// The website isn't an ecosystem entry: it is where they are listed
const apps = new Map([
  ['website', { name: 'Website', icon: 'solar:global-linear', to: '/' }],
  ...ecosystem.map(
    (entry) =>
      [
        entry.id,
        { name: entry.name, icon: entry.icon, to: `/ecosystem#${entry.id}` },
      ] as const,
  ),
])

// Each change with its app's name, icon and link. An id that names no app
// fails the build rather than showing under the wrong one.
export const ecosystemChanges = changes.map((change) => {
  const app = apps.get(change.app)
  if (!app)
    throw new Error(`Unknown app in the ecosystem changelog: ${change.app}`)
  return { date: change.date, text: change.text, ...app }
})
