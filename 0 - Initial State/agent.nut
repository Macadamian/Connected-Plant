
local serverURL = "http://iot613-officeshrub.azurewebsites.net";
local agentId = split(http.agenturl(), "/")[2];

function setRegistration(request, response) {
    // TODO: Implement PUT registration
};

function onWebRequest(request, response) {
    // If the device is disconnected, and we receive a request,
    // return a 404.
    if(!device.isconnected()) {
        response.send(404, "Device is offline.");
        return;
    }

    try {
        response.send(400, "{\"error\": \"Not a valid operation\"}");
    } catch (ex) {
        response.send(500, "Internal Server Error: " + ex);
    }
};

// This line is important. It allows the imp cloud to process any HTTP request that we make to the electricimp.
http.onrequest(onWebRequest);
