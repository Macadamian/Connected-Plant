// Assigning 3 LED Lights to 3 Pins.
onlineLed <- hardware.pin9;      // registration state, plant is "online"
button <- hardware.pin1;        // tweetbutton
hygrometer <- hardware.pin5;    // hygrometer pin

onlineLed.configure(DIGITAL_OUT);
hygrometer.configure(ANALOG_IN);

// reset our values
local isRegistered = false;
onlineLed.write(0);

function blink() {
    if(!isRegistered) {
        return;
    }

    onlineLed.write(0);

    imp.wakeup(0.5, function() {
        onlineLed.write(isRegistered.tointeger());
    });
};

function setRegistration(registerValue) {
    server.log("setRegistrationCalled :" + registerValue);
    isRegistered = registerValue;
    onlineLed.write(isRegistered ? 1 : 0);
    agent.send("onSetRegistration", isRegistered);
};

function getSensorData(val) {
    blink();

    local values = {};
    values.water <- hygrometer.read();
    values.light <- 0; // for now.
    agent.send("onSensorData", values);
};

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
agent.on("setRegistration", setRegistration);
