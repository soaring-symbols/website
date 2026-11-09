# Soaring Symbols website

The site for [Soaring Symbols](https://github.com/soaring-symbols/soaring-symbols), a curated collection of airline logos, icons and brand colors in SVG. Browse the collection, download any mark, and check new SVGs against the contribution guidelines.

Live at <https://soaringsymbols.org>.

## Development

The airline data and SVGs come from the `soaring-symbols` npm package, so a version bump there is all it takes to update the collection.

```bash
bun install
bun run dev
```

## Deployment

The site runs on Cloudflare Workers through Workers Builds. Nitro merges `wrangler.jsonc` into the config it generates in `.output/server`, so keep Worker settings in that file rather than in the dashboard.

Every page, the sitemap and the social card images (`app/components/OgImage/`) are prerendered at build time, one page per airline in the package, so the Worker mostly serves static files.

To try a production build locally:

```bash
WORKERS_CI=1 bun run build
npx wrangler --cwd .output dev
```

## Roadmap

### Website

- [x] Airline detail pages at `/airlines/[slug]`, so each airline has a link to share and a page search engines can index; link to them from the Browse slideover and the homepage icon wall
- [x] Prerender the pages at build time, since the airline data is static
- [x] Sitemap, Open Graph images and canonical URLs
- [x] Favicon and brand mark in the split-flap style (the mark's sources and the icons for the GitHub org, Raycast and Figma now live in [soaring-symbols/brand](https://github.com/soaring-symbols/brand))
- [x] Serve the site on <https://soaringsymbols.org>
- [x] List every mark on the airline page, color and monochrome side by side, and ask for the files that are missing
- [x] Country flags as SVG
- [x] Ecosystem page at `/ecosystem`, with every integration in full (including the image API's parameters and the launchers that run Raycast extensions) and a row of tiles on the homepage linking to it
- [x] Callsign, hubs and founding year on the airline page, a badge for airlines that ceased operations, and search by callsign
- [x] Earlier marks on the airline page, from the package's logo history (shows once the site uses a release with `history`)
- [x] Fix the hydration mismatches: the homepage spotlight, and error pages that rendered only in the browser (now `app/error.vue`)
- [ ] Drop the `@nuxt/fonts` 1.x entry in `nuxt.config.ts` once `@nuxt/ui` ships with it (the social cards need 1.x for Overpass)
- [ ] Run ESLint again, once typescript-eslint supports TypeScript 7 (or pin TypeScript 6 for linting)

### Ecosystem

Plans for the API on this site and for other integrations are tracked in the [main repository's roadmap](https://github.com/soaring-symbols/soaring-symbols#roadmap), so they don't need updating in two places. The integrations shown on the ecosystem page and the homepage, shipped or in development, are listed in `app/data/ecosystem.ts`.
