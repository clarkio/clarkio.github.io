import rss from '@astrojs/rss';

export const get = () => rss({
  title: 'Brian Clark',
  description: 'Developer advocate and content creator who loves to learn new things and share them.',
  site: import.meta.env.SITE,
  items: import.meta.glob('./blog/**/*.md'),
  customData: `<language>en-us</language>`,
  stylesheet: '/rss/styles.xsl',
});