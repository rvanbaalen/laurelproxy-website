import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import pagefind from "astro-pagefind";
import sitemap from "@astrojs/sitemap";

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://laurelproxy.robinvanbaalen.nl",

  integrations: [
    react(),
    pagefind(),
    sitemap(),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: cloudflare(),
});