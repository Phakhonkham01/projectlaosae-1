// nuxt.config.ts - CORRECTED VERSION
export default defineNuxtConfig({
  // ✅ Move modules to the root level (not inside nitro)
  modules: ["@nuxtjs/tailwindcss"],
  ssr: false,

  // ✅ Keep your nitro config but without modules
  nitro: {
    prerender: {
      routes: ["/"], // Add only safe pages
      ignore: ["/", "/login", "/booking/**"],
    },
  },

  // ❌ REMOVE the manual PostCSS config - the module handles this
  // css: ["~/assets/css/main.css"],
  // postcss: {
  //   plugins: {
  //     tailwindcss: {},
  //     autoprefixer: {},
  //   },
  // },

  compatibilityDate: "2025-07-12",
});
