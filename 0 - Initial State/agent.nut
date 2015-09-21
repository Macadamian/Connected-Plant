
local serverURL = "http://iot613-officeshrub.azurewebsites.net";
local agentId = split(http.agenturl(), "/")[2];

server.log("Request sensor data: " + http.agenturl() + "?all=read");
server.log("Set Registration: " + http.agenturl() + "register=true");
server.log("Set Alert Mode: " + http.agenturl() + "?alert&light=on&water=on");

function setRegistration(request, response) {
    // TODO: Implement PUT registration
}

function fetchRegistration() {
    // TODO: Implement Getting current registration from the server.
}

function setAlerts(request, response) {
    // TODO: implement PUT alerts.
}

function getAlerts(request, response) {
    // TODO: Implement GET Alerts
}

function requestSensorData(request, response) {
    // TODO: Implement requesting light + water sensor data.
}

function onWebRequest(request, response) {
    // If the device is disconnected, and we receive a request,
    // return a 404.
    if(!device.isconnected()) {
        response.send(404, "Device is offline.");
        return;
    }

    try {
        // TODO: Implement handling of things here.
    } catch (ex) {
        response.send(500, "Internal Server Error: " + ex);
    }
}

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
