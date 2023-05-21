import rss from '@astrojs/rss';

const allPosts = Object.values(
  import.meta.glob('./blog/**/*.md', { eager: true })
);
console.log(allPosts.map((post) => post.url));
const sortedPosts = allPosts.sort(
  (a, b) =>
    new Date(b.frontmatter.publishDate).valueOf() -
    new Date(a.frontmatter.publishDate).valueOf()
);

export const get = () =>
  rss({
    title: 'Brian Clark',
    description:
      'Developer advocate and content creator who loves to learn new things and share them.',
    site: import.meta.env.SITE,
    items: sortedPosts.map((post) => {
      if (post.url.includes('old-posts')) {
        const result = handleOldPosts(post);
        console.log(result);
        return result;
      } else {
        return {
          link: post.url,
          title: post.frontmatter.title,
          pubDate: post.frontmatter.publishDate,
        };
      }
    }),
    customData: `<language>en-us</language>`,
  });

function handleOldPosts(post) {
  const oldUrl = post.url.replace('/blog/old-posts/', '').replace('/blog/');
  const year = oldUrl.slice(0, 4);
  const month = oldUrl.slice(5, 7);
  const day = oldUrl.slice(8, 10);
  const name = oldUrl.slice(11);
  const newUrl = `/${year}/${month}/${day}/${name}`;

  return {
    link: newUrl,
    title: post.frontmatter.title,
    pubDate: post.frontmatter.publishDate,
  };
}
