onlineLed <- hardware.pin9;      // registration state, plant is "online"
onlineLed.configure(DIGITAL_OUT);
button <- hardware.pin1;        // tweetbutton
hygrometer <- hardware.pin5;    // hygrometer pin
hygrometer.configure(ANALOG_IN);

// 1. setup pins
photosensor <- hardware.pin2;   // photo sensor pin
photosensor.configure(ANALOG_IN);

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
    blink();
    agent.send("onSetRegistration", isRegistered);
};

function onButtonPressed() {
    local state = button.read();
    if(state == 1) {
        agent.send("onButtonPressed", state);
    }
};

function getSensorData(val) {
    blink();
    local values = {};
    values.water <- hygrometer.read();
    values.light <- photosensor.read();
    agent.send("onSensorData", values);
};

// Register handlers... Have to do it after declaring onbuttonpressed;
// Uses embedded resistors. Reads high by default, but all of it is transparent.
button.configure(DIGITAL_IN_PULLUP, onButtonPressed);

agent.on("setRegistration", setRegistration);

// 2. agent event handler for a sensor data request.
agent.on("requestSensorData", getSensorData);
