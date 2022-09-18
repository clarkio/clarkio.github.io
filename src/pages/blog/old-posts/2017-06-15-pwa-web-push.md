---
title: 'Progressive Web Apps and Web Push API - Introduction'
publishDate: June 15, 2017
author: 'Brian Clark'
description: "Part 1 of the PWA and Web Push API blog series. This one covers an introduction to progressive web apps (PWA's)."
keywords: 'pwa, progressive web app, web push, api, web push api, javascript, node.js, node, nodejs'
layout: '../../../layouts/BaseLayout.astro'
---

#### PWA and Web Push API Blog Series

1. Introduction (this post)
2. [Subscriber](/2017/08/04/pwa-web-push-2)
3. [Application Server](/2017/08/22/pwa-web-push-3)
4. [Pushing Messages](/2017/10/18/pwa-web-push-4)

<hr>

# Progressive Web Apps and Web Push API

[Progressive Web Apps (PWA)](https://en.wikipedia.org/wiki/Progressive_web_app) are a great way to create excellent experiences for users on the web and mobile. I've recently been experimenting in this space and have found it to be a lot of fun to create such apps. As part of my app, I wanted to be able to push notification messages to all clients whether they're using the web or mobile instance of the PWA. I found that this can be done through the [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API).

First, to summarize PWA, the main components of one are the app shell and service worker. The app shell is responsible for your User Interface (UI) containing your HTML, CSS and JavaScript. The service worker handles things in the background for your app focusing on operations that don't need an interface or user driven actions.

In my experimentation, I created a PWA and quickly jumped into sending notifications to clients using the [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API). This involves three pieces communicating together: an Application Server, a Push Service and a Subscriber. The [Push Summary](https://blog.mozilla.org/services/2016/08/23/sending-vapid-identified-webpush-notifications-via-mozillas-push-service/) details described by Mozilla were a huge help in getting a grasp on how all these components interface with each other. In my case the Application Server is a Node.js app and the Subscriber is my PWA. As for the Push Service, think of it as a third-party solution which the various browser vendors handle for now (I'll dive deeper into this in a later post).

With these tools I was able to push notifications through a Node.js web server running on Azure. This was set up by leveraging the [web-push](https://github.com/web-push-libs/web-push) module which helps in securely creating the correct message payloads to be received by the service worker running on the client. The result is a browser notification displayed on the user's machine with the message:

<img class="post-image" src="/assets/old-posts/img/pwa-web-push/result-animation.gif" alt="a progressive web app with web push API sending notifications to clients">

Continue reading and learn about setting up the PWA subscriber in the next post: [Progressive Web Apps and Web Push API - Subscriber](/2017/08/04/pwa-web-push-2)
