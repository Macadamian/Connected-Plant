var fs = require("fs");
var LOG_DIR = __dirname + "/../logs/";
var PLANT_FILENAME = __dirname + "/../logs/plant.log";
var CRASH_FILENAME = __dirname + "/../logs/crash.log";
var OLD_SUFFIX = ".OLD.log";
var MAX_LINES_TO_REPORT = 2500;
var MAX_FILE_SIZE_IN_MBS = 1000*1000;

function htmlify(data) {
    var html = "<html><body>";
    var lines = data.match(/[^\r\n]+/g);
    var index = lines.length - MAX_LINES_TO_REPORT < 0 ? 0 : lines.length - MAX_LINES_TO_REPORT;
    for ( ; index < lines.length; index++) {
        html += "<p>" + lines[index] + "</p>";
    }
    html += "</body></html>";
    return html;
};

function fetchLogs(filename, onSuccess, onFailure) {
    fs.readFile(filename, "utf-8", function(err, data) {
        if(err) {
            onFailure(err);
        } else {
            var html = htmlify(data);
            onSuccess(html);
        }
    });
};

var self = module.exports = {
    plantlogsAreRollingOver: false,
    init: function() {
        if (!fs.existsSync(LOG_DIR)){
            fs.mkdirSync(LOG_DIR);
        };
        fs.readFile(PLANT_FILENAME, function(err, data) {
            if(err) {
                console.log(err);
            }

            if(err || data == "") {
                console.log("Creating log file");
                fs.writeFile(PLANT_FILENAME, "");
                return;
            }

            fs.appendFile(PLANT_FILENAME, "********** STARTING TO LOG **********" + "\r\n");
        });
    },
    rolloverLogFileIfNecessary: function(pathToFile) {
        if(module.exports.plantlogsAreRollingOver) {
            return;
        }

        module.exports.plantlogsAreRollingOver = true;
        fs.stat(pathToFile, function(err, stats) {
            if(err) {
                module.exports.plantlogsAreRollingOver = false;
                return;
            }

            if(stats.size >= MAX_FILE_SIZE_IN_MBS) {
                var pathToOldFile = pathToFile + OLD_SUFFIX;
                fs.renameSync(pathToFile, pathToOldFile);
                fs.writeFileSync(PLANT_FILENAME, "*** Logs were rolled over ***\r\n");
            }

            module.exports.plantlogsAreRollingOver = false;
        });
    },
    logCrash: function(message, postLogOperation) {
        console.log("Uncaught exception: " + message);
        fs.appendFile(CRASH_FILENAME, message, function(err) {
            postLogOperation();
        });
    },
    logPlantMessage: function(message) {
        console.log(message);
        fs.appendFile(PLANT_FILENAME, message + "\r\n", function (err) {
            if (err) {
                console.log(err);
            }

            // Note: We really should not be doing this everytime we log.
            // But this is a demo server!
            module.exports.rolloverLogFileIfNecessary(PLANT_FILENAME);
        });
    },
    fetchCrashLogs: function(onSuccess, onFailure) {
        fetchLogs(CRASH_FILENAME, onSuccess, onFailure);
    },
    fetchPlantLogs: function(onSuccess, onFailure) {
        fetchLogs(PLANT_FILENAME, onSuccess, onFailure);
    }
};
