var constants = require("../constants.js");
var sensorutils = require("./sensorutils.js");

var PlantModel = (function() {
    function PlantModel(name) {
        this.name = name;
        this.totalMinutesOfSunlight = 0;
        this._history = {
            light: [],
            water: []
        };
        // TODO: revisit = id seems wrong.
        this.status = {
            light: {
                description: constants.LIGHT.UNKNOWN.description,
                value: constants.LIGHT.UNKNOWN.value
            }, water: {
                description: constants.WATER.UNKNOWN.description,
                value: constants.WATER.UNKNOWN.value
            }
        };
    };

    PlantModel.prototype.cleanup = function() {
        this._history.light = [];
        this._history.water = [];
        this.totalMinutesOfSunlight = 0;
    };

    PlantModel.prototype.getSunlightInMinutes = function() {
        var sunlightInMinutes = 0;
        for(var i=0; i < this._history.light.length; i++) {
            if(this._history.light[i].light >= constants.LIGHT.CLOUDY.threshold) {
                sunlightInMinutes += 5; // HACK: Value should be computed, not hardcoded.
            }
        }

        return sunlightInMinutes;
    };

    PlantModel.prototype.trimData = function(dataType, range) {
        var values = [];
        var data = this._history[dataType];
        if(data === undefined) {
            return values;
        }

        var length = data.length;
        var start = range.start || 0;
        var count = range.count || length;

        if (count > length) {
            count = length;
        }

        if (start + count > length) {
            start = 0;
        }

        for (var i = length - start - count; i < length - start; i++) {
            values.push(data[i]);
        }

        return values;
    };

    PlantModel.prototype.updateStatus = function(type, status) {
        this.status[type] = status;
    };

    PlantModel.prototype.pushLight = function(lightPayload) {
        if(lightPayload.light >= constants.LIGHT.CLOUDY.threshold && this._history.light.length > 1) {
            var deltaInMs = lightPayload.timestamp - this._history.light[this._history.light.length-1].timestamp;
            var deltaInMinutes = (deltaInMs / (1000 * 60)).toFixed(1);
            this.totalMinutesOfSunlight += parseFloat(deltaInMinutes);
        }

        this._history.light.push(lightPayload);
    };

    PlantModel.prototype.getCurrentLight = function() {
        return this._history.light[this._history.light.length - 1];
    };

    PlantModel.prototype.getAverageLight = function() {
        return sensorutils.average(this._history.light, "light");
    };

    PlantModel.prototype.getLightData = function() {
        return this._history.light;
    };

    PlantModel.prototype.pushWater = function(waterPayload) {
        this._history.water.push(waterPayload);
    };

    PlantModel.prototype.getCurrentWater = function() {
        return this._history.water[this._history.water.length - 1];
    };

    PlantModel.prototype.getAverageWater = function() {
        return sensorutils.average(this._history.water, "water");
    };

    PlantModel.prototype.getWaterData = function() {
        return this._history.water;
    }

    return PlantModel;
})();

module.exports = PlantModel;
