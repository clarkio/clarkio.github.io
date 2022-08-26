---
title:      "Progressive Web Apps and Web Push API - Application Server"
publishDate:       August 22, 2017
author:     "Brian Clark"
layout: "../../layouts/BaseLayout.astro"
---
#### PWA and Web Push API Blog Series

1. [Introduction](/2017/06/15/pwa-web-push)
2. [Subscriber](/2017/08/04/pwa-web-push-2)
3. Application Server (this post)
4. [Pushing Messages](/2017/10/18/pwa-web-push-4)

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

    You should see the following message in your browser:

    <img class="post-image" src="/assets/old-posts/img/pwa-web-push-3/start-node-running-message.png" alt="The web page result when navigating to http://localhost:3000">

### Generate VAPID Keys
Now that we have an application server we can add our code to support the Web Push protocol. We'll be using the [web-push](https://github.com/web-push-libs/web-push) npm package to help us out and you should have it already installed from when we ran `npm i` earlier.

As mentioned in the last post, our PWA client (subscriber) is ready to leverage the Web Push API using the Voluntary Application Server Identification for Web Push protocol (VAPID). In order to use the VAPID in our Node.js server we first need to generate a public/private key pair. Thankfully, the [web-push](https://github.com/web-push-libs/web-push) package provides a way for us to generate these keys.

To save you from having to do yet another install you can run the following in terminal to generate these keys:
    `node_modules/web-push/src/cli.js generate-vapid-keys --json`

> Another option is to install web-push globally so that it is accessible directly from your terminal: `npm i -g web-push && web-push generate-vapid-keys --json`

After you run that command you should see a similar output to what is shown below.

<img class="post-image" src="/assets/old-posts/img/pwa-web-push-3/generate-keys-output.png" alt="The keys generated using the web-push generate-vapid-keys command in terminal">

Now we need to put those key values in a place that our application server can access them. A good place to store them for local development (temporarily) is in our shell profile file as environment variables. In bash this is your `.bash_profile` file which is typically found in `~/.bash_profile` on a Mac. If you're using a different shell please refer to its documentation to determine the profile file to store your VAPID keys in.

Open up your profile file and add the following as new lines, replacing <your_key_value> with your respective keys (pay attention to which is the public vs. private environment variable):

```
export VAPID_PUBLIC_KEY="<your_public_key_value>"
export VAPID_PRIVATE_KEY="<your_private_key_value>"
```

>Don't forget the quotes "" around each key value

### Set Up Web-Push
Let's update our Node.js application server to implement the Web Push protocol.

1. Get the VAPID public and private keys by adding the following code after line 14 in `server.js`

    ```javascript
    let vapidKeys = {
        publicKey: process.env.VAPID_PUBLIC_KEY,
        privateKey: process.env.VAPID_PRIVATE_KEY
    };
    ```

2. Give `webPush` the VAPID information (Note: webPush is already defined on line 3) by adding this code right after where the `vapidKeys` were added.

    ```javascript
    webPush.setVapidDetails(
        'mailto:email@domain.com',
        vapidKeys.publicKey,
        vapidKeys.privateKey
    );
    ```

3. Set up a variable to store client subscriptions in memory for now with this code and place it on the next line

    ```javascript
    let subscriptions = [];
    ```

### Create Endpoints
At this point we have an application server that speaks web-push but no interface to talk web-push with it. Let's add some endpoints to which our clients can connect.

1. First, we need to set up `bodyParser` to read the client's request body and parse it into JSON. Add the following code to the server after the `subscriptions` definition:

    ```javascript
    app.use(bodyParser.json());
    ```
2. For security reasons, our client's browser will block requests to our API unless we set up CORS so add the following code to permit this from any host for now:

    ```javascript
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header(
            'Access-Control-Allow-Headers',
            'Origin, X-Requested-With, Content-Type, Accept'
        );
        return next();
    });
    ```

3. In order to allow clients to tell the application server they wish to subscribe let's create a route that can handle accepting subscriptions

    ```javascript
    app.post('/subscribe', (req, res) => {
        const body = JSON.stringify(req.body);
        let sendMessage;
        if (_.includes(subscriptions, body)) {
            sendMessage = constants.messages.SUBSCRIPTION_ALREADY_STORED;
        } else {
            subscriptions.push(body);

            sendMessage = constants.messages.SUBSCRIPTION_STORED;
        }
        res.send(sendMessage);
    });
    ```

    <b>What's this code doing?</b><br/>
    It's creating an endpoint that first takes the JSON found in the body of the request and converts it to a string so we can store it in the subscriptions array for later reference.

    It then checks to make sure there isn't an existing subscription in the `subscriptions` array and leveraging the lodash library to do the check.

    If the subscription doesn't already exist it will be added to the array otherwise it will just be skipped and an appropriate response message is sent back to the client to indicate the result.

4. Lastly, we'll add an endpoint so we can create push notifications from the application server to the subscriber clients.

    ```javascript
    app.post('/push', (req, res, next) => {
        const pushSubscription = req.body.pushSubscription;
        const notificationMessage = req.body.notificationMessage;

        if (!pushSubscription) {
            res.status(400).send(constants.errors.ERROR_SUBSCRIPTION_REQUIRED);
            return next(false);
        }

        if (subscriptions.length) {
            subscriptions.map((subscription, index) => {
            let jsonSub = JSON.parse(subscription);

            webPush.sendNotification(jsonSub, notificationMessage)
                .then(success => handleSuccess(success, index))
                .catch(error => handleError(error, index));
            });
        } else {
            res.send(constants.messages.NO_SUBSCRIBERS_MESSAGE);
            return next(false);
        }

        function handleSuccess(success, index) {
            res.send(constants.messages.SINGLE_PUBLISH_SUCCESS_MESSAGE);
            return next(false);
        }

        function handleError(error, index) {
            res.status(500).send(constants.errors.ERROR_MULTIPLE_PUBLISH);
            return next(false);
        }
    });
    ```

    <b>What's this code doing?</b><br/>
    This code creates an endpoint that expects a POST request with a JSON body containing two keys: `pushScription` (the subscription to which it will send the push message) and `notificationMessage` (the text to include as part of the push message). The code grabs that data from the request, double checks a subscription was provided for this message (more on this in a later post) and uses `webPush` to `sendNotification` to all subscriptions in the `subscriptions` array. The rest is some quick error and response handling.

### Testing Things Out
Let's ensure everything is set up and working as expected by send some dummy data to our updated application server.

1. Run the server by executing the following command in your terminal:

    `node server.js`

2. Open up a REST client (I suggest and will be using [Postman](https://www.getpostman.com/))

3. Set up your client to execute a POST request to [http://localhost:3000/subscribe](http://localhost:3000/subscribe) and with the following dummy data as the raw body value:

    ```json
    {"endpoint":"","expirationTime":null,"keys":{"p256dh":"","auth":""}}
    ```

4. Confirm you receive the response message "Subscription stored"

    <img class="post-image" src="/assets/old-posts/img/pwa-web-push-3/postman-test-result.png" alt="The Postman REST client POST request and response results">

5. Go back to your terminal and press `CTRL + c` to stop the server

Our application server is all set to handle subscriptions from clients and push notification messages to the subscribers using the [web-push](https://github.com/web-push-libs/web-push) Node.js library. We'll see how we can tie it all together and start pushing notification messages to the subscribers [in the next post](/2017/10/18/pwa-web-push-4)
