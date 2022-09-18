---
title: 'Running Node.js in Azure'
publishDate: June 23, 2017
author: 'Brian Clark'
description: 'This article walks through how to set up resources in Azure to host and run your Node.js apps'
keywords: 'node.js, nodejs, node, azure, javascript, js'
layout: '../../layouts/BaseLayout.astro'
---

# Running Node.js in Azure (2017)

Do you have an amazing web API or application built with Node.js? Do you have somewhere to host it that is safe, reliable and offers many more helpful resources to successfully run it in production? I recently went through the experience of setting up my Node.js API in Azure and found it to be simple to deploy the API successfully in the cloud. Below you'll find the steps I took to accomplish such a feat in case you'd like to try them out yourself.

If you'd prefer, you can watch the following short videos capturing these same steps as I narrate through them.

## Preparing Azure to Run an Existing Node.js Application

<div class="video-container">
<iframe width="560" height="315" src="https://www.youtube.com/embed/CFtLF5qVshI" frameborder="0" allowfullscreen></iframe>
</div>

## Connecting Node.js Source Code to Azure from GitHub

<div class="video-container">
<iframe width="560" height="315" src="https://www.youtube.com/embed/IQ7hGovGEmM" frameborder="0" allowfullscreen></iframe>
</div>

## Prerequisites

- [Create an account with Azure](https://azure.microsoft.com/)
  - Note: Consider using the free trial to test things out

> You can find my Node.js API source code on [GitHub](https://github.com/clarkio/simple-node-server) if you'd like to fork it and use with this guide.

## Preparing Azure to Run an Existing Node.js Application

1. In the Azure portal, select "App Services" from the menu
2. Click the "Add" button
3. Select the "Web App" option from the gallery
4. Click "Create"
5. Fill out the following fields:

- App name
  > This is the name of the app and is used as part of the URL to access it
- Subscription
  > This is your account type you've opened up with Azure. The best option for testing things out is to use the Free Trial.
- Resource Group
  > This creates a logical grouping of all resources you may use within Azure
- App Service plan/location
  > This is based on your account type and subscription

6. Check the "Pin to dashboard" option
7. Click "Create"
8. When the deployment succeeds you should be presented with the "Overview" blade for your new App Service. Click on the "Browse" link to test and verify everything is working.

## Connecting Node.js Source Code to Azure from GitHub

1. Make sure your main JavaScript file is named `server.js`
2. In the Azure portal and while viewing the "Overview" blade of your App Service, find the "Quickstart" option under the "DEPLOYMENT" section and click it
3. Click the "Node.js" option
4. Click the "Cloud Based Source Control" option
5. Click the "here" link found in step 2
6. Click "Choose Source" and select "GitHub"
   > If you haven't connected your GitHub account with Azure do so through the "Authorization" option
7. Click "Choose your organization" and select the correct organization where your repository is located in GitHub
8. Click "Choose project," find your repository and click it
9. Click "Choose branch" if you want Azure to use a different branch than the default one
10. Click "OK" and Azure will begin setting up the deployment from GitHub. You should see a notification that it is in progress and then again when it completes
11. Once the deployment setup is finished, click on "Deployment options" found under the "DEPLOYMENT" section on the left-hand side
12. If you see "no deployments found" click the "Sync" button to trigger a pull of your source code from GitHub into Azure. You'll see a confirmation dialog, click "Yes" to confirm you want to sync.
    > When the sync is done you should see that Azure pulled in your latest commit and its corresponding message. You should also see a check mark and the text "Active" indicating your source code is now running.
13. Click on "Overview"
14. Click on "Browse" and it will open up a new tab pointing to your web app's URL.
    > You can also skip steps 13-14 and go directly to your web app's URL in a separate tab. Remember that it's [your app name].azurewebsites.net

You should now see your app running successfully in Azure. If you have any questions or comments feel free to reach out in the comments below or on [twitter (@\_clarkio)](https://twitter.com/_clarkio).
