---

title:      "Options in X-Frame-Options"
date:       2016-10-28
author:     "Brian Clark"


description: "An explanation of the options available for use in the X-FRAME-OPTIONS header"
keywords: "security, headers, web, development, iframe, clickjacking, X-FRAME-OPTIONS, content security policy, csp"
---

I ran across [Scott Smith's blog](http://scottksmith.com/blog/) which has a series on [Securing Node Apps Against OWASP Top 10](http://scottksmith.com/blog/2015/06/08/secure-node-apps-against-owasp-top-10-injection/) (it's quite good and worth a read). I saw that he had briefly touched upon the use of `X-FRAME-OPTIONS` as one of the solutions to mitigate [Cross-site Request Forgery](http://scottksmith.com/blog/2015/06/29/secure-node-apps-against-owasp-top-10-cross-site-request-forgery/). In that example the option used as the value of this header was `DENY`. In addition to this value there are a couple of other options available to you as well. This inspired me to share more on this mitigation technique and the other options available as values for this HTTP header.

Something to note first is that this mitigation technique is also useful for protecting against [Clickjacking](https://www.owasp.org/index.php/Clickjacking) attacks. These attacks involve tricking a user into clicking something that performs an action they were not intending to do and for a website of which the user is unaware. The attack is made possible by using an `<iframe>` whose source is pointing to the vulnerable website's URL and whose visibility is not made apparent to the user. Then with some styling tricks the attacker lures the victim to their website where the `<iframe>` element is hosted and entices them to click on items that are actually found within the vulnerable site.

The `X-FRAME-OPTIONS` header tells the browser whether a website's resources can actually be loaded as the source within an `<iframe>` HTML element. If the header value is `DENY` then the browser will block the resources from loading no matter what domain is attempting to load the website. While `DENY` is usually the only option you'd need, what if you have a legitimate use case for an `<iframe>`?

You have two other options if this is the situation you're in:

1. `SAMEORIGIN`
2. `ALLOW-FROM`

### SAMEORIGIN
This option restricts your website to only be loaded within an `<iframe>` if the parent page is from the same domain. As an example, if your website is `www.clark.com`, if `www.google.com` tried to use an iframe pointing to your resource at `www.clarkio.com/about` it would be blocked. However, if you had a page within `www.clarkio.com` that attempted to load the same resource it would be permitted.

### ALLOW-FROM
This option restricts your website to only be loaded from a specific list of domains you define. These domains are defined immediately following the `ALLOW-FROM` value and are space delimited.

Something to be aware of about this particular option is that its browser support is somewhat limited. [Chrome and Safari](https://www.owasp.org/index.php/Clickjacking_Defense_Cheat_Sheet#X-Frame-Options_Header_Types) do not honor this header and instead are looking for this information in a [Content Security Policy](https://www.owasp.org/index.php/Content_Security_Policy) directive. Which directive depends on the browsers you are expecting your site to work in and which version of the Content Security Policy those browsers support.

If your browser supports CSP 1.0 then the directive is `frame-src`. If it's CSP 2.0 then you'll want to use `frame-ancestors`.

> [CSP 3.0 (as of 10/28/2016)](https://w3c.github.io/webappsec-csp/) is in draft and it seems they will be [undeprecating `frame-src`](https://w3c.github.io/webappsec-csp/#changes-from-level-2) and using that as the standard again. Fun stuff!

## Which Option Should I Use?
If you're wondering which option you should use, the safest option is `DENY`.

If you find there's no way around using an `<iframe>` for your site then I suggest to make its use as explicit and as restrictive as possible. Have a defined list of origins that you want to allow to perform this action and that's it. Anything else will leave your site vulnerable to the risks associated with clickjacking attacks.

You can find more results for other browsers and their support for all options of `X-FRAME-OPTIONS` in this [compatibility test](http://erlend.oftedal.no/blog/tools/xframeoptions/).