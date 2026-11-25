# Soaring Symbols website

The site for [Soaring Symbols](https://github.com/soaring-symbols/soaring-symbols), a curated collection of airline logos, icons and brand colors in SVG. Browse the collection, download any mark, and check new SVGs against the contribution guidelines.

Live at <https://soaringsymbols.org>.

## Pages

- `/airlines` and `/airlines/[slug]`: every airline, with its marks (color, monochrome and dark side by side, plus earlier ones), codes, hubs, founding year, former names, alliance, and the airlines it succeeded or was succeeded by
- `/alliances` and `/alliances/[slug]`: each alliance's marks, slogan and members, past ones included
- `/validate`: checks SVGs against the contribution guidelines and fixes what it can, in the browser
- `/ecosystem`: every integration (npm, CDN, the API, Raycast, Figma, Framer, draw.io and more), with the API's parameters
- `/changelog`: the package's GitHub releases
- `/brand`: the Soaring Symbols logos and icons, to download
- `/api/airlines` and `/api/alliances`: JSON and image API, no key needed (parameters on the ecosystem page)

## Development

The airline data and SVGs come from the `soaring-symbols` npm package, so a version bump there is all it takes to update the collection.

```bash
bun install
bun run dev
```

To see changes to the package before they are released, with its repository checked out next to this one (or at `SOARING_SYMBOLS_PATH`):

```bash
bun run dev:local
```

It builds the package, copies its `dist/` into `node_modules` and starts the dev server (`node scripts/use-local-package.mjs --no-build` only copies). Restart it after each change to the package, since `nuxt.config.ts` reads the data when the server starts. `bun install --force` goes back to the release from npm.

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

- [ ] Run ESLint again, once typescript-eslint supports TypeScript 7 (or pin TypeScript 6 for linting)

### Ecosystem

Plans for the API on this site and for other integrations are tracked in the [main repository's roadmap](https://github.com/soaring-symbols/soaring-symbols#roadmap), so they don't need updating in two places. The integrations shown on the ecosystem page and the homepage, shipped or in development, are listed in `app/data/ecosystem.ts`.

## License

The site's code is [MIT](LICENSE). The airline and alliance marks it shows are trademarks of their owners and are not covered by it (see the package's [Disclaimer](https://github.com/soaring-symbols/soaring-symbols/blob/main/DISCLAIMER.md)), and neither is the Soaring Symbols name and mark.
