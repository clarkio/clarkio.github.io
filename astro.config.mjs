// Full Astro Configuration API Documentation:
// https://docs.astro.build/reference/configuration-reference
import { defineConfig, passthroughImageService } from 'astro/config'
import sitemap from '@astrojs/sitemap'

// https://astro.build/config
export default defineConfig({
  site: 'https://clarkio.com/',
  integrations: [sitemap()],
  image: {
    service: passthroughImageService()
  }
})
