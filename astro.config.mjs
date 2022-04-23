// Full Astro Configuration API Documentation:
// https://docs.astro.build/reference/configuration-reference
import svelte from '@astrojs/svelte';
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  integrations: [svelte(), sitemap()],
  site: 'https://clarkio.com'
});
