onlineLed <- hardware.pin9;      // registration state, plant is "online"
onlineLed.configure(DIGITAL_OUT);

// reset our values
local isRegistered = false;
onlineLed.write(0);

function blink() {
    if(!isRegistered) {
        return;
    }

    onlineLed.write(1 - onlineLed.read());
    imp.wakeup(0.5, blink);
};

function setRegistration(registerValue) {
    server.log("setRegistrationCalled :" + registerValue);
    isRegistered = registerValue;
    onlineLed.write(isRegistered ? 1 : 0);
    blink();
    agent.send("onSetRegistration", isRegistered);
};

agent.on("setRegistration", setRegistration);
