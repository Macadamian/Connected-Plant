local serverURL = "http://iot613-officeshrub.azurewebsites.net";
local agentId = split(http.agenturl(), "/")[2];
local shareURL = serverURL + "/" + agentId + "/share";

server.log("Request sensor data: " + http.agenturl() + "?all=read");
server.log("Share Status: " + shareURL);
server.log("Set Registration [POST]: " + http.agenturl() + "register=true");

function setRegistration(request, response) {
    local registrationValue = request.query.register == "true";
    server.log((registrationValue == 1 ? "Registering" : "Unregistering") +  " the plant.");

    // 2. Send a request to the device.
    device.send("setRegistration", registrationValue);

    // 4. Handle the response from the device...
    device.on("onSetRegistration", function(val) {
        response.send(200, "{\"isRegistered\": \"" + val + "\"}");
    });
};

function onWebRequest(request, response) {
    if(!device.isconnected()) {
        response.send(404, "Device is offline.");
        return;
    }

    try {
        // 1. Setup the request handler
        if("register" in request.query &&
            request.method == "POST") {
            setRegistration(request, response);
        } else {
            response.send(400, "{\"error\": \"Not a valid operation\"}");
        }
    } catch (ex) {
        response.send(500, "Internal Server Error: " + ex);
    }
};

// 4. We need to handle the button being pressed from the device.
device.on("onButtonPressed", function(data){
    local request = http.post(shareURL, {}, "");
    local response = request.sendsync();
    server.log("button press statuscode: " + response.statuscode);
});

// This line is important. It allows the imp cloud to process any HTTP request that we make to the electricimp.
http.onrequest(onWebRequest);
