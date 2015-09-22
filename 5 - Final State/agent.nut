
local serverURL = "http://iot613-officeshrub.azurewebsites.net";
local agentId = split(http.agenturl(), "/")[2];

server.log("Request sensor data: " + http.agenturl() + "?all=read");
server.log("Share Status: " + serverURL + "/" + agentId + "/share");
server.log("Set Registration [POST]: " + http.agenturl() + "register=true");
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
};

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

function setAlerts(request, response) {
    local alerts = {};
    try {
        if (request.query.light != null) {
            server.log("Set Light Alert: " + request.query.light);
            alerts.light <- request.query.light == "true" ? 1 : 0;
        }
    } catch(err) {
        alerts.light <- null;
    }

    try {
        if (request.query.water != null) {
            server.log("Set Water alert: " + request.query.water);
            alerts.water <- request.query.water == "true" ? 1 : 0;
        }
    } catch(err) {
        alerts.water <- null;
    }

    if(alerts.light != null || alerts.water != null) {
        device.send("setAlerts", alerts);
        device.on("onSetAlerts", function(val) {
            response.send(200, "OK");
        });
    }
};

function getAlerts(request, response) {
    device.send("getAlerts", 0);
    device.on("onGetAlerts", function(alerts) {
        // server.log("Water Alert: " + alerts.water + " Light Alert: " + alerts.light);
        response.send(200, "{\"water\": \"" + alerts.water + "\", \"light\": \"" + alerts.light + "\"}");
    });
};

function requestSensorData(request, response) {
    device.send("requestSensorData", 0);

    device.on("onSensorData", function(val) {
        server.log("Water Sensor: " + val.water + " Light Sensor: " + val.light);
        response.send(200, "{\"water\": \"" + val.water + "\", \"light\": \"" + val.light + "\"}");
    });
};

function onWebRequest(request, response) {
    if(!device.isconnected()) {
        response.send(404, "Device is offline.");
        return;
    }

    try {
        // Check if the user sent led as a query parameter
        if ("alert" in request.query)
        {
            if(request.method == "POST") {
                setAlerts(request, response);
            } else if(request.method == "GET") {
                getAlerts(request, response);
            }
        }
        else if("register" in request.query &&
            request.method == "POST") {
            setRegistration(request, response);
        }
        // Connected Plant Sensor query handling.
        else if ("all" in request.query) {
            requestSensorData(request, response);
        } else {
            response.send(400, "{\"error\": \"Not a valid operation\"}");
        }
    } catch (ex) {
        response.send(500, "Internal Server Error: " + ex);
    }
};

device.on("onButtonPressed", function(data){
    local shareUrl = serverURL + "/" + agentId + "/share";
    server.log("detected a button press. Notifying server: " + shareUrl);
    local request = http.post(shareUrl, {}, "");
    local response = request.sendsync();
    server.log("button press statuscode: " + response.statuscode);
});

// Register the HTTP handler to begin watching for incoming HTTP requests
http.onrequest(onWebRequest);

// Handles a device coming offline, and then going online.
device.onconnect(function() {
    server.log("Device connected to agent - Syncing with Server");
    fetchRegistration();
});

device.ondisconnect(function() {
    server.log("Device Disconnected!");
    device.send("setRegistration", 0);
});
