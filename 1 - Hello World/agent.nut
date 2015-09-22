
local serverURL = "http://iot613-officeshrub.azurewebsites.net";
local agentId = split(http.agenturl(), "/")[2];

server.log("Set Registration [POST]: " + http.agenturl() + "?registration=true");

function setRegistration(request, response) {
    try {
        local registrationValue = request.query.register == "true";
        server.log((registrationValue == 1 ? "Registering" : "Unregistering") +  " the plant.");

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

// This line is important. It allows the imp cloud to process any HTTP request that we make to the electricimp.
http.onrequest(onWebRequest);
