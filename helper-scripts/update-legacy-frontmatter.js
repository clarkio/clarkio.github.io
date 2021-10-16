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

  // postContents = postContents.replace('layout:     post', '');
  // postContents = postContents.replace('comments: True', '');
  // postContents = postContents.replace('comments:   True', '');
  // postContents = postContents.replace('header-class: "grayscale-img"', '');
  // postContents = postContents.replace(
  //   'header-img: "img/pbp-angular-man-sm3.png"',
  //   ''
  // );
  // postContents = postContents.replaceAll(
  //   '{% highlight javascript %}',
  //   '```javascript'
  // );
  // postContents = postContents.replaceAll('{% highlight bash %}', '```bash');
  // postContents = postContents.replaceAll('{% endhighlight %}', '```');
  let linkRegex = /{{ site.baseurl }}{% post_url ([\w\d\-_]+) %}/;
  // linkRegex.test(postContents);
  postContents.match().groups?.forEach((group) => {
    // TODO finish this you knuckleheaded baboon
    console.log(group);
  });
  const matchResults = postContents.match(linkRegex);
  if (matchResults && matchResults.length > 0) {
    matchResults.forEach((result) => {
      console.log(result);
    });
  }

  // postContents = postContents.replaceAll('{{', '');
  // postContents = postContents.replaceAll('}}', '');
  // postContents = postContents.replaceAll('{%', '');
  //{{ site.baseurl }}
  //{% post_url 2017-10-18-pwa-web-push-4 %}
  // {{ site.baseurl }}{% post_url 2017-06-15-pwa-web-push %}
  // /2017-06-15-pwa-web-push

  // postContents = postContents.replaceAll('%}', '');
  // fs.writeFileSync(outputDirectory + postName, postContents);
});
