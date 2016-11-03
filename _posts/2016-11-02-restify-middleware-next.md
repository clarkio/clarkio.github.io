---
layout:     post
title:      "Restify Middleware & Next()"
date:       2016-11-02
author:     "Brian Clark"
header-class: "grayscale-img"
keywords: "headers already set, next(), restify next(), short-circuit request, node restify"
comments: True
---

If you've used any kind of Node.js web frameworks (such as [Express](http://expressjs.com/) or [Restify](http://restify.com/)) before you've probably used plenty of middleware modules, but have you built one before? If you've built one before, have you ever needed to short-circuit the request handling chain by blocking the execution of the next middleware module and returning your own response? If so you may have run into the same issue that I had struggled with for quite some time.

I've built several middleware modules that are specifically tied to Restify as the underlying web framework running with Node.js. Some of these modules I've had the need to break the request handling chain and return my own response. However for the longest time I wasn't quite doing it right. Let's take a look at an example of what I was doing:

{% highlight javascript %}
server.get('/secure/route',
  // My short-circuiting middleware module
  function checkAuthorization (req, res, next) {
    res.send(401, 'Unauthorized');
    return next();
  },
  // My route implementation
  function routeAction (req, res, next) {
    res.send(200, { data: 'secure data' });
    return next();
  }
);
{% endhighlight %}

Now looking at this you may be thinking it is perfectly fine and in some cases it actually could be, but I don't actually want to allow the execution of whatever middleware module is next. Meaning, while I'm supposed to always return `next();` in my routes when using Restify (as stated in the [official documentation](http://restify.com/#routing)), this code results in the next module being accessed.

The other problem this leads to is that it will execute two instances of `res.send()` and this causes an error stating `can't set headers after they are sent`. The reason for this is that we attempt to set those headers with the first instance of `res.send()` in our middleware module and then, since we're not blocking the route implementation execution, we attempt to use `res.send()` a second time.

What I had failed to miss all this time was passing in an argument to the `next()` function to indicate I want things to stop there. The nice thing is it's as simple as passing in the boolean value `false` as an argument to `next()`. Having this in place, I still follow the correct pattern and best practice of always returning `next()`, but also accomplish short-circuiting the middleware chain. Here is what my code looks like after the changes:

{% highlight javascript %}
server.get('/secure/route',
  // My short-circuiting middleware module
  function checkAuthorization (req, res, next) {
    res.send(401, 'Unauthorized');
    return next(false);
  },
  // My route implementation
  function routeAction (req, res, next) {
    res.send(200, { data: 'secure data' });
    return next();
  }
);
{% endhighlight %}

Typically you would pass in an error to the `next()` function in order to signal a breakage in the handler chain (such as `next(new Error('some error message');`, but in this case we don't necessarily have an error and would rather just handling things ourselves. I had overlooked the possibility of this option to use `false` as a value in the documentation which specifically states:
<blockquote>
You can pass in  false to not error, but to stop the handler chain. This is useful if you had a res.send in an early filter, which is not an error, and you possibly have one later you want to short-circuit.
</blockquote>
