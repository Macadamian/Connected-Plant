var sensorutils = require("./sensorutils.js");
var constants = require("../constants.js");
var logger = require("../Logger");
var EventEmitter = require("events").EventEmitter;

// This controller/model pair represents a specific sensor, tied to a specific hardware revision.
// Putting this on the server offsets the cost of maintaining, and risks associated with flashing hardware, and performance as well.
// Provided that we have consistent sensor behavior -> it is better to program this on the server.
// When the sensors are inconsistent from every hardware, then this needs to be abstracted out on the device.
var LightSensorController = (function() {
    // HACK: Indoors hack.
    var PHOTO_VERY_BRIGHT = 12000;
    var PHOTO_VERY_DARK = 0;
    var DEBOUNCE_RATE = 3;  // every 3 records, we compute average, and send it up

    function LightSensorController(rate) {
        this.debounceRate = rate || DEBOUNCE_RATE;
        this.sensorData = [];
    };

    var util = require("util");
    util.inherits(LightSensorController, EventEmitter);

    LightSensorController.prototype.pushSensorData = function(rawSensorData) {
        if(this.sensorData.length >= this.debounceRate) {
            var latestTimestamp = this.sensorData[this.sensorData.length-1].timestamp;
            var lightSensorPayload = {timestamp: latestTimestamp, light: this.getCurrentPercentage()};
            this.emit(constants.SENSOR_UPDATE, lightSensorPayload);
            this.sensorData = [];
        }

        this.sensorData.push({ timestamp: Date.now(), raw: rawSensorData});
    }

    LightSensorController.prototype.getCurrentPercentage = function() {
        var averageRawLightData = sensorutils.average(this.sensorData, constants.RAW);
        return this.computerPercentage(averageRawLightData);
    };

    // Note: this could be abstracted out further. Because this is really the only thing that could be abstracted here.
    LightSensorController.prototype.computerPercentage = function(rawSensorData) {
        if(rawSensorData > PHOTO_VERY_BRIGHT) {
            rawSensorData = PHOTO_VERY_BRIGHT;
        }

        return Math.ceil(((rawSensorData - PHOTO_VERY_DARK) / (PHOTO_VERY_BRIGHT - PHOTO_VERY_DARK) * 100));
    };

    return LightSensorController;
})();

module.exports = LightSensorController;
