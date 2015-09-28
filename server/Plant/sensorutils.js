// No idea if this is right... was trying to get to a static/global functions?
var SensorUtils = {
    average: function(arrSensorData, property) {
        var sum = 0;
        for (var i = 0; i < arrSensorData.length; i++) {
            sum += parseInt(arrSensorData[i][property]);
        }
        return Math.round(sum / arrSensorData.length);
    }
};

module.exports = SensorUtils;
