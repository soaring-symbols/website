import { createRequire } from "node:module";
import { resolve } from "node:path";

const require = createRequire(import.meta.url);
const soaringSymbolsDir = resolve(
  require.resolve("soaring-symbols/package.json"),
  "..",
);

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: ["~/assets/main.css"],

  modules: ["@nuxt/ui"],

  compatibilityDate: "2025-07-15",

  devtools: { enabled: true },

  alias: {
    "#airlines-data": resolve(soaringSymbolsDir, "dist/airlines.json"),
  },

  vite: {
    optimizeDeps: {
      exclude: ["soaring-symbols"],
    },
  },

  nitro: {
    publicAssets: [
      {
        baseURL: "/airlines",
        dir: resolve(soaringSymbolsDir, "dist/assets"),
      },
    ],
  },
});
