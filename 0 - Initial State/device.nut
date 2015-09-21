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
    // TODO: implement blinking.
}

function setRegistration(registerValue) {
    // TODO: implement setting the registration.
    // TODO: Include the blink.
}

// Function to turn LED on or off
function setAlerts(alerts) {
    // TODO: Implement Alert
}

function getAlerts(value) {
    // TODO: Implement alerts building.
}

function getSensorData(val) {
    // TODO: implement blinking.
}

function onButtonPressed() {
    // TODO: Implement button pressing.
}