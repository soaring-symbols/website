# AGENTS.md

Instructions for AI coding agents working on the Soaring Symbols website. `README.md` covers development, deployment and the roadmap; the airline data and SVGs come from the `soaring-symbols` npm package, whose own `AGENTS.md` lives in [soaring-symbols/soaring-symbols](https://github.com/soaring-symbols/soaring-symbols).

## Project

- Nuxt 4 + Vue 3, deployed on Cloudflare Workers. Every page is prerendered (`nitro.prerender.routes` in `nuxt.config.ts`): add a new page there and to `server/routes/sitemap.xml.ts`.
- `app/pages/` pages, `app/components/` components, `app/composables/` shared logic, `app/data/` static data, `app/utils/` helpers, `server/` the JSON and image API.
- Data that changes without a package release (GitHub stars, releases) is read while prerendering and again in the browser, and a failed read must never fail the build.

## UI

- Use Nuxt UI components for every UI element rather than custom HTML; they are auto-imported. Site-wide component styles live in `app/app.config.ts`, theme tokens and utilities in `app/assets/main.css`. The Nuxt UI MCP server (`.mcp.json`) has the component docs.
- Icons: Solar's linear style (`solar:*-linear`), `simple-icons:*` for brand logos. Another set only where Solar has nothing fitting (e.g. `carbon:plane`, an aircraft), with a comment saying why.
- Every component works in light and dark mode: use Nuxt UI's color tokens (`text-muted`, `bg-default`, `var(--ui-primary)`) rather than fixed colors.
- Vue files use `<script setup>` in plain JavaScript (no `lang="ts"`), blocks in the order `<template>`, `<script setup>`, `<style scoped>`.

### Line up text with `cap-center`

Overpass, the site's font, sits its capitals high in the line box, so text set next to an icon or inside a button, badge or other box looks about a tenth of an em too high. The `cap-center` utility (`app/assets/main.css`) moves it down to line up.

`app.config.ts` already applies it to button, badge, tab and radio labels, the navigation menu's link labels and changelog dates, so don't add it to those; a button label shown on phones only needs `ui: { label: 'block' }`. Page header titles (`pageHeader.title`) have it too. Add it yourself, without being asked, everywhere else text lines up with an icon or box:

- Text beside an icon in the same row: `<UIcon … /><span class="cap-center">Label</span>`.
- A component whose label `app.config.ts` doesn't cover: add it to that component's slot there rather than on each use, when every use needs it.

Leave it off paragraphs and other running text, and never nest it (the shift adds up). Check the result in a zoomed screenshot: the middle of the capitals should sit level with the middle of the icon or box.
