
local serverURL = "http://iot613-officeshrub.azurewebsites.net";
local agentId = split(http.agenturl(), "/")[2];

server.log("Request sensor data: " + http.agenturl() + "?all=read");
server.log("Set Alert Mode: " + http.agenturl() + "?alert&light=on&water=on");

function setRegistration(request, response) {
    try {
        local registrationValue = request.query.register == "true";
        if(registrationValue == 1) {
            server.log("Registering this plant.");
        } else {
            server.log("Unregistering this plant");
        }

        // turn on green led
        device.send("setRegistration", registrationValue);
        device.on("onSetRegistration", function(val) {
            response.send(200, "{\"isRegistered\": \"" + val + "\"}");
        });

    } catch(err) {
        server.log(err);
        response.send(500, "Internal Server Error No Plant Name provided: " + err);
    }
}

function fetchRegistration() {
    // TODO: Fetch registration from the server.
};

function setAlerts(request, response) {
    // TODO: implement PUT alerts.
};

function getAlerts(request, response) {
    // TODO: Implement GET Alerts
};

function requestSensorData(request, response) {
    // TODO: Implement requesting light + water sensor data.
};

function onWebRequest(request, response) {
    if(!device.isconnected()) {
        response.send(404, "Device is offline.");
        return;
    }

    try {
        if("register" in request.query &&
            request.method == "POST") {
            setRegistration(request, response);
        } else {
            response.send(200, "{\"error\": \"Not a valid operation\"}");
        }
    } catch (ex) {
        response.send(500, "Internal Server Error: " + ex);
    }
};

device.on("onButtonPressed", function(data){
    // TODO: Include Button Press Handler Here.
});

// This line is important. It allows the imp cloud to process any HTTP request that we make to the electricimp.
http.onrequest(onWebRequest);

// Handles a device coming offline, and then going online.
device.onconnect(function() {
    // TODO: Handle device connecting to the imp cloud.
});

device.ondisconnect(function() {
    // TODO: Handle device disconnecting to the imp cloud.
});
