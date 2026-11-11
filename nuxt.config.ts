import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import app from './package.json'

const require = createRequire(import.meta.url)
const soaringSymbolsDir = resolve(
  require.resolve('soaring-symbols/package.json'),
  '..',
)
const assetsDir = resolve(soaringSymbolsDir, 'dist/assets')
const airlinesFile = resolve(soaringSymbolsDir, 'dist/airlines.json')
const airlines: { slug: string; previous_slugs?: string[] }[] = JSON.parse(
  readFileSync(airlinesFile, 'utf8'),
)
// A renamed airline's page moves to its new slug; old links get a permanent
// redirect (previous_slugs is in the package from the release after 0.2.4).
// Its SVGs stay at the old path too, since the package ships them there.
const formerSlugRedirects = Object.fromEntries(
  airlines.flatMap((airline) =>
    (airline.previous_slugs ?? []).map((slug) => [
      `/airlines/${slug}`,
      {
        redirect: { to: `/airlines/${airline.slug}`, statusCode: 301 as const },
      },
    ]),
  ),
)
// Country flags, served as files so each loads once, cached, and only where
// it is shown: a few carry detailed arms that would weigh down every page
const flagsDir = resolve(
  require.resolve('flag-icons/package.json'),
  '..',
  'flags/4x3',
)

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
  ],

  compatibilityDate: '2025-07-15',

  devtools: { enabled: true },

  fonts: {
    defaults: {
      weights: [400, 600, 800],
    },
  },

  routeRules: formerSlugRedirects,

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
      { baseURL: '/flags', dir: flagsDir, maxAge: 60 * 60 * 24 * 365 },
    ],
    // The image API reads the SVGs to tint and render them, and a Worker
    // cannot read its static files: bundle a copy as server assets
    serverAssets: [{ baseName: 'airlines', dir: assetsDir }],
    // Lets the image API import resvg's WebAssembly module
    experimental: {
      wasm: true,
    },
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
        '/ecosystem',
        '/sitemap.xml',
        ...airlines.map((airline) => `/airlines/${airline.slug}`),
      ],
      failOnError: true,
    },
  },
})
