import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import posthog from "astro-posthog";
import pagefind from "astro-pagefind";
import sitemap from "@astrojs/sitemap";

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://laurelproxy.robinvanbaalen.nl",

  integrations: [
    react(),
    ...(process.env.PUBLIC_POSTHOG_KEY
      ? [posthog({ posthogKey: process.env.PUBLIC_POSTHOG_KEY })]
      : []),
    pagefind(),
    sitemap(),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: cloudflare(),
});