var constants = require("../constants.js");

var PlantReport = (function() {
    function PlantReport(name) {
        this.name = name;
        this.time = Date.now();
        this.sunlightInMinutes = 0;

        this.light = {
            value: constants.LIGHT.UNKNOWN.value,
            average: 0
        };
        this.water = {
            value: constants.WATER.UNKNOWN.value,
            average: 0
        };
        this.wasWatered = false;
        this.criedForHelp = false;
    };
    return PlantReport;
})();

module.exports = PlantReport;
