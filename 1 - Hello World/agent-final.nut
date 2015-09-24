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

// This line is important. It allows the imp cloud to process any HTTP request that we make to the electricimp.
http.onrequest(onWebRequest);

// Handles a device coming offline, and then going online.
device.onconnect(function() {
    server.log("Device connected to agent.");
    fetchRegistration();
});

function fetchRegistration() {
    try {
        server.log("Fetching registration status from the server.");
        local isRegisteredUrl = serverURL + "/" + agentId + "/registered";
        local request = http.get(isRegisteredUrl, {});
        local response = request.sendsync();

        if(response.statuscode == 200) {
            local data = http.jsondecode(response.body);
            device.send("setRegistration", data.isRegistered);
            device.on("onSetRegistration", function(value) {
                server.log("Successfully registered device");
            });
        } else {
            server.log("Could not fetch the registration.");
        }

    } catch(err) {
        server.log("Could not fetch the registration: " + err);
    }
};
