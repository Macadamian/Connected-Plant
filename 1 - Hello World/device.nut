// 3. Configure Pin #9
// onlineLed <- hardware.pin9;      // registration state, plant is "online"
// onlineLed.configure(DIGITAL_OUT);

// 4. Initialize things.
// local isRegistered = false;
// onlineLed.write(0);

// 9. Actual blinking.
//function blink() {
//    if(!isRegistered) {
//        return;
//    }
//
//    onlineLed.write(1 - onlineLed.read());
//    imp.wakeup(0.5, blink);
//};

function setRegistration(registerValue) {
// 7. Setup registration - based on the value provided by the agent.
//    server.log("setRegistrationCalled :" + registerValue);
//    isRegistered = registerValue;
//    onlineLed.write(isRegistered.tointeger());


// 8. return a response registration.
//    agent.send("onSetRegistration", isRegistered);


// 10. Enabling the blinking.
//    blink();

};

// 6. Need to handle messages from the agent!
// agent.on("setRegistration", setRegistration);
