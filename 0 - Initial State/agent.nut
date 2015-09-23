local serverURL = "http://iot613-officeshrub.azurewebsites.net";
local agentId = split(http.agenturl(), "/")[2];
local shareURL = serverURL + "/" + agentId + "/share";

server.log("Request sensor data: " + http.agenturl() + "?all=read");
server.log("Share Status: " + shareURL);
server.log("Set Registration [POST]: " + http.agenturl() + "register=true");

function onWebRequest(request, response) {
    // If the device is disconnected, and we receive a request,
    // return a 404.
    if(!device.isconnected()) {
        response.send(404, "Device is offline.");
        return;
    }

    try {
        // TODO: insert handling here.
        response.send(400, "{\"error\": \"Not a valid operation\"}");
    } catch (ex) {
        response.send(500, "Internal Server Error: " + ex);
    }
};

// This line is important. It allows the imp cloud to process any HTTP request that we make to the electricimp.
http.onrequest(onWebRequest);
