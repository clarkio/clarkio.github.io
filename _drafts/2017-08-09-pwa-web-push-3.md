---
layout:     post
title:      "Progressive Web Apps and Web Push API - Application Server"
date:       2017-08-09
author:     "Brian Clark"
header-class: "grayscale-img"
comments:   True
---
#### PWA and Web Push API Blog Series

1. [Introduction]({{ site.baseurl }}{% post_url 2017-06-15-pwa-web-push %})
2. [Subscriber]({{ site.baseurl }}{% post_url 2017-08-04-pwa-web-push-2 %})
3. Application Server (this post)

----------

## Progressive Web Apps and Web Push API - Application Server
We created a subscriber client in the last post but we need somewhere for it to send the subscription. This is where the application server comes in. It will act as the subscription manager for all of the subscribing clients. We'll also use it to construct notifications that are published to the subscribers. Let's get right into it.

### Simple Node.js Server
To get us started we're going to create a simple Node.js server with Express and we'll leverage my [node-web-push](https://github.com/clarkio/node-web-push) server on GitHub to save some time setting up.

1. Clone the repository
    
    Using https:
    `git clone https://github.com/clarkio/node-web-push.git`
    
    Using ssh:
    `git clone git@github.com:clarkio/node-web-push.git`

2. Change to the project directory

    `cd node-web-push`

3. Switch to the `start` branch

    `git checkout start`

4. Install external dependencies

    `npm i`

5. Start the server

    `node server`

6. Open up a browser to [localhost:3000](http://localhost:3000)

    You should see the following message in your browser