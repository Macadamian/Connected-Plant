var sensorutils = require("./sensorutils.js");
var constants = require("../constants.js");
var logger = require("../Logger");
var EventEmitter = require("events").EventEmitter;

// This controller/model pair represents a specific sensor, tied to a specific hardware revision.
// Putting this on the server offsets the cost of maintaining, and risks associated with flashing hardware, and performance as well.
// Provided that we have consistent sensor behavior -> it is better to program this on the server.
// When the sensors are inconsistent from every hardware, then this needs to be abstracted out on the device.
var WaterSensorController = (function() {
    var HYDRO_WET = 45000; // wet enough
    var HYDRO_DRY = 20000; // starting to feel thirsty
    var DEBOUNCE_RATE = 3;  // every 3 records, we compute average, and send it up

    function WaterSensorController(rate) {
        this.sensorData = [];
        this.debounceRate = rate || DEBOUNCE_RATE;
    };

    var util = require("util");
    util.inherits(WaterSensorController, EventEmitter);

    WaterSensorController.prototype.pushSensorData = function(rawSensorData) {
        if(this.sensorData.length >= this.debounceRate) {
            var latestTimestamp = this.sensorData[this.sensorData.length-1].timestamp;
            var waterSensorPayload = {timestamp: latestTimestamp, water: this.getCurrentPercentage()};
            this.emit(constants.SENSOR_UPDATE, waterSensorPayload);
            this.sensorData = [];
        }

        this.sensorData.push({ timestamp: Date.now(), raw: rawSensorData});
    };

    WaterSensorController.prototype.getCurrentPercentage = function() {
        var averageRawWaterData = sensorutils.average(this.sensorData, constants.RAW);
        return this.computerPercentage(averageRawWaterData);
    };

    // Note: this could be abstracted out further. Because this is really the only thing that could be abstracted here.
    WaterSensorController.prototype.computerPercentage = function(rawSensorData) {
        if (rawSensorData > HYDRO_WET) {
            rawSensorData = HYDRO_WET;
        } else if (rawSensorData < HYDRO_DRY ) {
            rawSensorData = HYDRO_DRY;
        }
        return Math.ceil((rawSensorData - HYDRO_DRY)/(HYDRO_WET - HYDRO_DRY) * 100);
    };

    return WaterSensorController;
})();

module.exports = WaterSensorController;
