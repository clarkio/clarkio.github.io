---
layout:     post
title:      "Progressive Web Apps and Web Push API"
date:       2017-06-15
author:     "Brian Clark"
header-class: "grayscale-img"
comments:   True
---

### Progressive Web Apps and Web Push API

Progressive Web Apps (PWA) are a great way to create excellent experiences for users on the web and mobile. I've recently been experimenting in this space and have found it to be a lot of fun to create such apps.

The main components of a PWA are the app shell and service worker(s). The app shell is responsible for your User Interface (UI) containing your HTML, CSS and JavaScript. The service worker handles things in the background for your app focusing on operations that don't need an interface or user driven actions. 

In my experimentation, I've been looking into sending notifications to PWA clients leveraging the [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API). This involves three pieces communicating together: an Application Server, a Push Service and a Subscriber. The [Push Summary](https://blog.mozilla.org/services/2016/08/23/sending-vapid-identified-webpush-notifications-via-mozillas-push-service/) details described by Mozilla were a huge help in getting a grasp on how all these components interface with each other.

With these tools I'm able to push notifications through a Node.js web server running on Azure. This was set up by leveraging the [web-push](https://github.com/web-push-libs/web-push) module which helps in creating the correct, secure, messages to be received by the service worker running on the client. The result is a browser notification displayed on the user's machine with the message provided:

<img src="{{ site.baseurl }}/img/pwa-web-push/result-animation.gif" alt="a progressive web app with web push API sending notifications to clients">