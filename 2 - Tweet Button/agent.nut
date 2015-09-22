

local serverURL = "http://iot613-officeshrub.azurewebsites.net";
local agentId = split(http.agenturl(), "/")[2];

server.log("Share Status: " + serverURL + "/" + agentId + "/share");
server.log("Set Registration [POST]: " + http.agenturl() + "register=true");

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

// This line is important. It allows the imp cloud to process any HTTP request that we make to the electricimp.
http.onrequest(onWebRequest);
