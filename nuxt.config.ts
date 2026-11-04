import {
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { addTemplate } from '@nuxt/kit'
import app from './package.json'

const require = createRequire(import.meta.url)
const soaringSymbolsDir = resolve(
  require.resolve('soaring-symbols/package.json'),
  '..',
)
const assetsDir = resolve(soaringSymbolsDir, 'dist/assets')
const airlinesFile = resolve(soaringSymbolsDir, 'dist/airlines.json')
const airlines: { slug: string }[] = JSON.parse(
  readFileSync(airlinesFile, 'utf8'),
)

// Hex colors an SVG paints with, from fill and stroke attributes and styles
const RE_PAINT = /(fill|stroke|stop-color)\s*[:=]\s*["']?(#[0-9a-f]{3,8})\b/gi

function paintColors(svg: string) {
  return new Set(
    [...svg.matchAll(RE_PAINT)].map(([, , color]) => color!.toLowerCase()),
  )
}

// The package ships *-mono.svg only for multi-color marks. A single-color
// mark is its own monochrome version in another color, so derive one the
// way the package draws them: every paint set to currentColor.
function toMono(svg: string) {
  return svg.replace(RE_PAINT, (match, prop: string, color: string) =>
    match.replace(color, 'currentColor'),
  )
}

const monoDir = resolve(import.meta.dirname, 'node_modules/.cache/airline-mono')

// Which SVG variants (logo, icon, logo-mono, tail, ...) each airline ships,
// so pages only link to files that exist, plus the mono files derived above
function airlineAssetsModule(_options: unknown, nuxt: any) {
  rmSync(monoDir, { recursive: true, force: true })

  const manifest: Record<string, string[]> = {}
  const derived: Record<string, string[]> = {}

  for (const entry of readdirSync(assetsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const slug = entry.name
    const files = readdirSync(resolve(assetsDir, slug))
      .filter((file) => file.endsWith('.svg'))
      .map((file) => file.replace(/\.svg$/, ''))
    manifest[slug] = files

    for (const variant of ['logo', 'icon', 'tail']) {
      if (!files.includes(variant) || files.includes(`${variant}-mono`))
        continue
      const svg = readFileSync(
        resolve(assetsDir, slug, `${variant}.svg`),
        'utf8',
      )
      if (paintColors(svg).size !== 1) continue

      mkdirSync(resolve(monoDir, slug), { recursive: true })
      writeFileSync(resolve(monoDir, slug, `${variant}-mono.svg`), toMono(svg))
      manifest[slug].push(`${variant}-mono`)
      ;(derived[slug] ??= []).push(`${variant}-mono`)
    }
  }

  const template = addTemplate({
    filename: 'airline-assets.mjs',
    getContents: () =>
      [
        `export default ${JSON.stringify(manifest)}`,
        `export const derived = ${JSON.stringify(derived)}`,
      ].join('\n'),
    write: true,
  })
  nuxt.options.alias['#airline-assets'] = template.dst
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: ['~/assets/main.css'],

  modules: [
    // Ahead of @nuxt/ui, which would otherwise install its own 0.x copy:
    // nuxt-og-image needs 1.x to hand the site fonts to the social cards
    '@nuxt/fonts',
    '@nuxt/ui',
    '@nuxt/image',
    'nuxt-og-image',
    airlineAssetsModule,
  ],

  compatibilityDate: '2025-07-15',

  devtools: { enabled: true },

  fonts: {
    defaults: {
      weights: [400, 600, 800],
    },
  },

  // Read by nuxt-og-image for absolute image URLs, and by the sitemap
  site: {
    url: app.homepage,
    name: app.displayName,
  },

  ogImage: {
    // Every page with a social card is prerendered, so the images are built
    // once at build time and the Worker ships no renderer
    zeroRuntime: true,
    defaults: {
      height: 630,
    },
  },

  alias: {
    '#airlines-data': airlinesFile,
  },

  runtimeConfig: {
    public: {
      site: {
        name: app.displayName,
        description: app.description,
        homepage: app.homepage,
      },
    },
  },

  hooks: {
    // nuxt-og-image reads local images from public/ while prerendering, and
    // the SVGs are served from the package instead; mount them where it looks
    'nitro:init'(nitro) {
      nitro.hooks.hook('prerender:config', (config) => {
        config.storage ||= {}
        config.storage['root:public:airlines'] = {
          driver: 'fs-lite',
          base: assetsDir,
        }
      })
    },
  },

  vite: {
    optimizeDeps: {
      exclude: ['soaring-symbols'],
      include: ['@vue/devtools-core', '@vue/devtools-kit'],
    },
  },

  nitro: {
    publicAssets: [
      {
        baseURL: '/airlines',
        dir: assetsDir,
        // Airline pages live under the same prefix as the SVGs
        fallthrough: true,
      },
      {
        // Mono versions of single-color marks, made by airlineAssetsModule
        baseURL: '/airlines',
        dir: monoDir,
        fallthrough: true,
      },
    ],
    // The airline data only changes with a package release, so every page
    // is built ahead of time and served as a static file
    prerender: {
      // Write /browse.html rather than /browse/index.html: Workers serves a
      // folder index only at its trailing-slash URL and redirects to it,
      // which would put every page one redirect away from its canonical URL
      autoSubfolderIndex: false,
      crawlLinks: true,
      routes: [
        '/',
        '/browse',
        '/validate',
        '/sitemap.xml',
        ...airlines.map((airline) => `/airlines/${airline.slug}`),
      ],
      failOnError: true,
    },
  },
})
