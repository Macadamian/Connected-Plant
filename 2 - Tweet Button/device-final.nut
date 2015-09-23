onlineLed <- hardware.pin9;      // registration state, plant is "online"
onlineLed.configure(DIGITAL_OUT);

// 1. Initialize the button.
button <- hardware.pin1;        // tweetbutton

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

// 3. Create function that handles the state.
function onButtonPressed() {
    local state = button.read();
    if(state == 1) {
        agent.send("onButtonPressed", state);
    }
};

// Register handlers... Have to do it after declaring onbuttonpressed;
// Uses embedded resistors. Reads high by default, but all of it is transparent.
// 2. Configure the button as a pull up.
button.configure(DIGITAL_IN_PULLUP, onButtonPressed);

agent.on("setRegistration", setRegistration);
