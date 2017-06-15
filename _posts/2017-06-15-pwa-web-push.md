---
layout:     post
title:      "Progressive Web Apps and Web Push API"
date:       2017-06-15
author:     "Brian Clark"
header-class: "grayscale-img"
comments:   True
---

### Progressive Web Apps and Web Push API

[Progressive Web Apps (PWA)](https://en.wikipedia.org/wiki/Progressive_web_app) are a great way to create excellent experiences for users on the web and mobile. I've recently been experimenting in this space and have found it to be a lot of fun to create such apps. As part of my app, I wanted to be able to push notification messages to all clients whether they're using the web or mobile instance of the PWA. I found that this can be done through the [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API).

First, to summarize PWA, the main components are the app shell and service worker. The app shell is responsible for your User Interface (UI) containing your HTML, CSS and JavaScript. The service worker handles things in the background for your app focusing on operations that don't need an interface or user driven actions. 

In my experimentation, I created a PWA and quickly jumped into sending notifications to clients using the [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API). This involves three pieces communicating together: an Application Server, a Push Service and a Subscriber. The [Push Summary](https://blog.mozilla.org/services/2016/08/23/sending-vapid-identified-webpush-notifications-via-mozillas-push-service/) details described by Mozilla were a huge help in getting a grasp on how all these components interface with each other.

With these tools I was able to push notifications through a Node.js web server running on Azure. This was set up by leveraging the [web-push](https://github.com/web-push-libs/web-push) module which helps in securely creating the correct message payloads to be received by the service worker running on the client. The result is a browser notification displayed on the user's machine with the message:

<img src="{{ site.baseurl }}/img/pwa-web-push/result-animation.gif" alt="a progressive web app with web push API sending notifications to clients">

I'll be sharing some more details around how I tied all these pieces together in the future. Be sure to check back later to find out more and see how you can start building a PWA as well.