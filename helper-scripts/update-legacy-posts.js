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

  // case insensitive with 0 or more spaces between
  postContents = postContents.replace(/layout: *post/i, '');
  postContents = postContents.replace(/comments: *True/i, '');

  postContents = postContents.replace('header-class: "grayscale-img"', '');
  postContents = postContents.replace(
    'header-img: "img/pbp-angular-man-sm3.png"',
    ''
  );

  // replace all by using regex and '/g'
  postContents = postContents.replace(
    /{% highlight javascript %}/g,
    '```javascript'
  );
  postContents = postContents.replace(/{% highlight bash %}/g, '```bash');
  postContents = postContents.replace(/{% endhighlight %}/g, '```');

  // find any links to other posts and convert to newer format
  let linkRegex = /{{ site.baseurl }}{% post_url ([\w\d\-_]+) %}/g;
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

  fs.writeFileSync(outputDirectory + postName, postContents);
});
