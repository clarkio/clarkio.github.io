import * as fs from 'fs';

const postsDirectory = './old-site-2021/_posts/';
const outputDirectory = './updated-legacy-posts/';
if (!fs.existsSync(outputDirectory)) {
  fs.mkdirSync(outputDirectory);
}

const posts = fs.readdirSync(postsDirectory);
posts.forEach((postName) => {
  let postContents = fs.readFileSync(postsDirectory + postName, {
    encoding: 'utf-8',
  });

  // Clean up some of the not needed Jekyll frontmatter
  // case insensitive with 0 or more spaces between
  postContents = postContents.replace(/layout: *post\n/i, '');
  postContents = postContents.replace(/comments: *True\n/i, '');

  postContents = postContents.replace('header-class: "grayscale-img"\n', '');
  postContents = postContents.replace("header-class: 'grayscale-img'\n", '');
  // postContents = postContents.replace('header-img: "img/plain-bg.png"\n', '');
  postContents = postContents.replace(/header-img: *"([\w\d\-\/.])+"\n/, '');
  postContents = postContents.replace(/header-img: *'([\w\d\-\/.])+'\n/, '');

  // Update Jekyll date key and format to Astro supported date
  postContents = postContents.replace(/date/i, 'publishDate');
  const dateRegex = /(\d{4})\-(\d{1,2})\-(\d{1,2})/;
  postContents = postContents.replace(dateRegex, function (match, token) {
    // 'match' is the full line match
    // 'token' is the group within the match (if any)
    // Convert old post Jekyll date (2017-12-01) to Astro date December 1, 2017
    const year = match.substr(0, 4);
    const month = match.substr(5, 2);
    const day = match.substr(8, 2);
    const jekyllDate = new Date(
      year,
      parseInt(month) - 1,
      parseInt(day),
      0,
      0,
      0,
      0
    ).toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    return jekyllDate;
  });

  // replace all by using regex and '/g'
  postContents = postContents.replace(
    /{% highlight javascript %}/g,
    '```javascript'
  );
  postContents = postContents.replace(/{% highlight bash %}/g, '```bash');
  postContents = postContents.replace(/{% endhighlight %}/g, '```');

  // find any links to other posts and convert to newer format
  const linkRegex = /{{ site.baseurl }}{% post_url ([\w\d\-_]+) %}/g;
  postContents = postContents.replace(linkRegex, function (match, token) {
    // 'match' is the full line match
    // 'token' is the group within the match (if any)
    // In this case the token is the post name such as '2016-02-19-first-post-first-course'
    // Replace first three dashes of token with '/' so Astro knows it's a route to navigate to
    // Example 2016/02/19/first-post-first-course
    // And prefix with initial root '/' for /2016/02/19/first-post-first-course
    return '/' + token.replace('-', '/').replace('-', '/').replace('-', '/');
  });

  postContents = postContents.replace(
    /{{ site.baseurl }}/g,
    '/assets/old-posts'
  );

  postContents = postContents.replace(
    '"<Extension Category>: <Command Title>"',
    '`<Extension Category>: <Command Title>`'
  );

  fs.writeFileSync(outputDirectory + postName, postContents);
});
