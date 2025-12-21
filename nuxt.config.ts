// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "nuxt-maplibre"],
  build: {
    transpile: ["@indoorequal/vue-maplibre-gl"],
  },
  vite: {
    optimizeDeps: {
      include: ["@indoorequal/vue-maplibre-gl", "maplibre-gl"],
    },
  },

  runtimeConfig: {
    graphhopperApiKey: process.env.GRAPHHOPPER_API_KEY,
    public: {
      MapTilerApiKey: process.env.MAPTILER_API_KEY,
    },
  },
});
