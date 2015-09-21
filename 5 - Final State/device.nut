// Assigning 3 LED Lights to 3 Pins.
waterAlertLed <- hardware.pin7; // red led for water alerts
lightAlertLed <- hardware.pin8; // yellow led for light alerts
onlineLed <- hardware.pin9;      // registration state, plant is "online"
button <- hardware.pin1;        // tweetbutton
photosensor <- hardware.pin2;   // photo sensor pin
hygrometer <- hardware.pin5;    // hygrometer pin

// Configuration of every pin
waterAlertLed.configure(DIGITAL_OUT);
lightAlertLed.configure(DIGITAL_OUT);
onlineLed.configure(DIGITAL_OUT);
photosensor.configure(ANALOG_IN);
hygrometer.configure(ANALOG_IN);

// reset our values
local isRegistered = false;
waterAlertLed.write(0);
onlineLed.write(0);
lightAlertLed.write(0);

function blink() {
    if(!isRegistered) {
        return;
    }

    onlineLed.write(0);

    imp.wakeup(0.5, function() {
        onlineLed.write(isRegistered.tointeger());
    });
}

function setRegistration(registerValue) {
    server.log("setRegistrationCalled :" + registerValue);
    isRegistered = registerValue;
    onlineLed.write(isRegistered ? 1 : 0);
    agent.send("onSetRegistration", isRegistered);
}

// Function to turn LED on or off
function setAlerts(alerts) {
    if(alerts.light != null) {
        server.log("Setting light alert state to: " + alerts.light);
        lightAlertLed.write(alerts.light.tointeger());
    }

    if(alerts.water != null) {
        server.log("Setting water alert state to: " + alerts.water);
        waterAlertLed.write(alerts.water.tointeger());
    }

    agent.send("onSetAlerts", alerts);
}

function getAlerts(value) {
    // All non-analog uses of pin.read() will return the actual state of the pin,
    // even if it is configured for output!
    local alerts = {};
    alerts.light <- lightAlertLed.read() == 1 ? true : false;
    alerts.water <- waterAlertLed.read() == 1 ? true : false;
    agent.send("onGetAlerts", alerts);
}

function getSensorData(val) {
    blink();

    local values = {};
    values.water <- hygrometer.read();
    values.light <- photosensor.read();
    agent.send("onSensorData", values);
}

function onButtonPressed() {
    local state = button.read();
    if(state == 1) {
        agent.send("onButtonPressed", state);
    }
}

// Register handlers... Have to do it after declaring onbuttonpressed;
button.configure(DIGITAL_IN_PULLUP, onButtonPressed);

// Register a handler for "led" messages from the agent
agent.on("requestSensorData", getSensorData);
agent.on("setAlerts", setAlerts);
agent.on("getAlerts", getAlerts);
agent.on("setRegistration", setRegistration);
