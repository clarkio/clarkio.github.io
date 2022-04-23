// Full Astro Configuration API Documentation:
// https://docs.astro.build/reference/configuration-reference

import svelte from '@astrojs/svelte';

export default {
  integrations: [
    svelte(),
  ],
  site: 'https://clarkio.com',
  sitemap: false,
}
