## About this repository 

Contains instructions and some of the bootstrapping required for the [IOT613](http:///www.iot613.com) technical workshop.
It also contains circuit designs and code for every step in the workshop.

[Follow](https://twitter.com/office_shrub), and see the default plant's current stats on its [website](https://iot613-officeshrub.azurewebsites.net/). 


## Prerequisites
##### Electric Imp
You need an Electric Imp Account. Create your account on the [Electric Imp website](https://ide.electricimp.com).
Once you have the account and are logged on, press the `Create New Model` button and create a model called `Connected-Plant` under the `Inactive Models` tab. Leave your empty model for now, and open your mobile phones.

You need to download the Electric Imp Mobile application. Get it for [Android](https://play.google.com/store/apps/details?id=com.electricimp.electricimp) or [iOS](https://itunes.apple.com/us/app/electric-imp/id547133856?mt=8).

You need an Electric Imp device to move forward.
Log on with your credentials in the application. You will then need to connect to your WiFi network of choice. BlinkUp your Electric Imp device like this: https://www.youtube.com/watch?v=zbhu7Mwicok

Now go back to the Electric Imp IDE. Click on `Unassigned Devices`, your device should be there. Pair it with your `Connected-Plant` model. Your imp is now ready to go.

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

##### Office Shrub [IOT613 Server]
[Register](https://iot613-officeshrub.azurewebsites.net/register.html) your device, but only when you have all relevant information. The server does not retain any information, and will be restarted before and after the workshop.

Your device will be available on the [main dashboard](https://iot613-officeshrub.azurewebsites.net/).

##### Bootstrap your application
Start bootstrapping your application with the agent.nut and device.nut files [here](https://github.com/Macadamian/Connected-Plant/tree/master/0%20-%20Initial%20State).
