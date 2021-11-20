// Full Astro Configuration API Documentation:
// https://docs.astro.build/reference/configuration-reference

export default {
  renderers: ['@astrojs/renderer-svelte'],
  buildOptions: {
    /** Your public domain, e.g.: https://my-site.dev/. Used to generate sitemaps and canonical URLs. */
    site: 'https://clarkio.com',
    /** Generate an automatically-generated sitemap for your build.
     * Default: true
     */
    sitemap: true,
  },
}
