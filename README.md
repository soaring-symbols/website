# Soaring Symbols website

The site for [Soaring Symbols](https://github.com/soaring-symbols/soaring-symbols), a curated collection of airline logos, icons and brand colors in SVG. Browse the collection, download any mark, and check new SVGs against the contribution guidelines.

Live at <https://soaring-symbols.anhthang.workers.dev>.

## Development

The airline data and SVGs come from the `soaring-symbols` npm package, so a version bump there is all it takes to update the collection.

```bash
bun install
bun run dev
```

## Deployment

The site runs on Cloudflare Workers through Workers Builds. Nitro merges `wrangler.jsonc` into the config it generates in `.output/server`, so keep Worker settings in that file rather than in the dashboard.

To try a production build locally:

```bash
WORKERS_CI=1 bun run build
npx wrangler --cwd .output dev
```

## Roadmap

### Website

- [ ] Airline detail pages at `/airlines/[slug]`, so each airline has a link to share and a page search engines can index; link to them from the Browse slideover and the homepage icon wall
- [ ] Prerender the pages at build time, since the airline data is static
- [ ] Sitemap, Open Graph images and canonical URLs
- [ ] Run ESLint again, once typescript-eslint supports TypeScript 7 (or pin TypeScript 6 for linting)

### Ecosystem

Shipped integrations are listed in `app/data/ecosystem.ts` and shown on the homepage.

- [x] npm package
- [x] Raycast extension
- [x] jsDelivr CDN
- [ ] Iconify icon set, for Iconify, Nuxt Icon, UnoCSS, Tailwind and Astro
- [ ] Figma plugin, to search airlines by name or IATA code and drop their marks into designs
- [ ] Swift Package, with an asset catalog and a SwiftUI view
- [ ] JSON API on the Worker, such as `/api/airlines/VN`
