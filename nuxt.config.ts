import { readdirSync } from 'node:fs'
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

// Which SVG variants (logo, icon, logo-mono, tail, ...) each airline ships,
// so pages only link to files that exist
function airlineAssetsModule(_options: unknown, nuxt: any) {
  const manifest = Object.fromEntries(
    readdirSync(assetsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => [
        entry.name,
        readdirSync(resolve(assetsDir, entry.name))
          .filter((file) => file.endsWith('.svg'))
          .map((file) => file.replace(/\.svg$/, '')),
      ]),
  )
  const template = addTemplate({
    filename: 'airline-assets.mjs',
    getContents: () => `export default ${JSON.stringify(manifest)}`,
    write: true,
  })
  nuxt.options.alias['#airline-assets'] = template.dst
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: ['~/assets/main.css'],

  modules: [
    '@nuxt/ui',
    '@nuxt/image',
    '@vercel/analytics',
    '@vercel/speed-insights',
    airlineAssetsModule,
  ],

  compatibilityDate: '2025-07-15',

  devtools: { enabled: true },

  fonts: {
    defaults: {
      weights: [400, 600, 800],
    },
  },

  alias: {
    '#airlines-data': resolve(soaringSymbolsDir, 'dist/airlines.json'),
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
      },
    ],
  },
})
