This repository contains all of the relevant code and information provided in the Connected Plant Workshop at [IOT613](http://www.iot613.com).

The code is contained in 3 folders:
`client` contains the web application's code, `eimp` contains the electric imp code which can be deployed to the electric imp IDE, and `server` contains the server code.

Furthermore, the documents used in the presentation are under `documents.`

Switch to the [workshop branch](https://github.com/Macadamian/Connected-Plant/tree/workshop) to have the exact repository used during the workshop.

## Prerequisites
You need to install [node.js](https://nodejs.org/), and [npm](https://www.npmjs.com/).

##### Electric Imp
You need an Electric Imp Account. Create your account on the [Electric Imp website](https://ide.electricimp.com).
Once you have the account and are logged on, press the `Create New Model` button and create a model called `Connected-Plant` under the `Inactive Models` tab. Leave your empty model for now, and open your mobile phones.

You need to download the Electric Imp Mobile application. Get it for [Android](https://play.google.com/store/apps/details?id=com.electricimp.electricimp) or [iOS](https://itunes.apple.com/us/app/electric-imp/id547133856?mt=8).

You need an Electric Imp device to connect your plant.
Log on with your credentials in the application. You will then need to connect to your WiFi network of choice. BlinkUp your Electric Imp device like this: https://www.youtube.com/watch?v=zbhu7Mwicok. Troubleshoot issues with this [guide](https://electricimp.com/docs/troubleshooting/blinkup/).

Now go back to the Electric Imp IDE. Click on `Unassigned Devices`, your device should be there. Pair it with your `Connected-Plant` model. Your imp is now ready to go.

Electric Imp uses an [API](https://electricimp.com/docs/api/) programmed in [Squirrel](https://electricimp.com/docs/squirrel/).

Electric Imp agent and device are found under `./eimp/`, but require to be deployed on the [Electric Imp](https://ide.electricimp.com/ide) web IDE, through the modern technique of copy pasting.

##### Twitter
You need a twitter account that's enabled for applications to proceed. *We recommend creating a new twitter account.*

First step is to create a [Twitter Application](https://apps.twitter.com/).
- Click on `Create new App`
- Give it a name: `Connected-Plant`
- Fill in the fields. For both containing URLs, use http://www.iot613.com
- Agree to the developer agreement, and your application is now created.
- Click on `Keys and Access Tokens`
- Scroll down, and click on `Create my Access Token`

You will now need to retain the values associated with the following information. Make sure it is correct, or else your plant will be unable to tweet.
```
Consumer Key (API Key)
Consumer Secret (API Secret)
Access Token
Access Token Secret
```
In `server/index.html`, you need to change the following twitter data to your own twitter account data.
```
defaultPlant.social.setTwitterConfig({
    handle: "@your_handle_here",
    keys: {
        consumer_key: "your_consumer_key_here",
        consumer_secret: "your_consumer_secret_here",
        access_token: "your_access_token_here",
        access_token_secret: "your_access_token_secret_here"
    },
    handler: function() {}
});
```

## Running the server locally
Run the server locally by running `npm install`, followed by `node server/index.js`.
Open the client in the browser on [Local](http://127.0.0.1:3000/) or
[Production](http://iot613-officeshrub.azurewebsites.net/).
