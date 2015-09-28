var request = require("request");
var util = require("util");
var querystring = require('querystring');
var constants = require("../constants.js");
var schedule = require('node-schedule');
var sensorutils = require("./sensorutils.js");
var logger = require("../Logger");
var PlantModel = require("./model.js");
var PlantReport = require("./report.js");
var SocialPlant = require("./social.js");
var LightSensorController = require("./lightsensorcontroller.js");
var WaterSensorController = require("./watersensorcontroller.js");

request.debug = true;

var Plant = (function() {
    var EIMP_URL = "https://agent.electricimp.com/%s?";
    var INTERVAL = 10000;
    var WAS_WATERED_PERCENT = 20;

    function Plant(name) {
        this._model = new PlantModel(name);
        this._eimp = {};
        this._twitter = {};
        this.interval = null;
        this.alerts = {water: false, light: false};
        this.isOnline = false;
        this.agentUrl = "";

        // Reports collected throughout the day.
        this.hourlyReports = [];
        this.yesterdayReport = null;
        this.currentReport = new PlantReport(name);

        this._lightcontroller = new LightSensorController();
        this._watercontroller = new WaterSensorController();
        this.social = new SocialPlant();

        var self = this;
        this._lightcontroller.on(constants.SENSOR_UPDATE, function(lightPayload) {
            self.log("Light Update Event: " + lightPayload.light + "%.");
            self.updateModel(lightPayload);

            if(lightPayload.light < constants.LIGHT.CLOUDY.threshold && self.alerts.light == false) {
                self.log("Starting Light Alert!");
                self.alerts.light = true;
                self.postAlerts();
            } else if (lightPayload.light > constants.LIGHT.CLOUDY.threshold && self.alerts.light == true) {
                self.log("Stopping Light Alert!");
                self.alerts.light = false;
                self.postAlerts();
            }
        });
        this._watercontroller.on(constants.SENSOR_UPDATE, function(waterPayload) {
            self.log("Water Update Event: " + waterPayload.water + "%.");
            self.updateModel(waterPayload);
            self.checkForWatering();
        });
        this.social.on(constants.MENTIONNED_ON_TWITTER, function(tweet) {
            self.log("Got a tweet from " + tweet.user.screen_name);
            self.log("Tweet content: " + tweet.text);

            var message = self.analyzeTweetMessage(tweet);
            if(message.length > 0) {
                self.social.say(message);
            }
        });

        this.initScheduledJobs();
    };

    Plant.prototype.initScheduledJobs = function() {
        var self = this;
        this._scheduledHourlyTask = schedule.scheduleJob('0 0 * * *', function() {
            self._model.cleanup();
        });
    };

    Plant.prototype.init = function() {
        //Listen to twitter and star the timer
        this.startTimer();
        this.social.stopListening();
        this.social.listenToTwitter();
        this.postAlerts();
    };

    Plant.prototype.getName = function() {
        return this._model.name;
    };

    Plant.prototype.getAgentId = function() {
        return this._eimp.agentId;
    };

    Plant.prototype.setElectricImpConfig = function(options) {
        this._eimp.agentId = options.agentId
        this.agentUrl = util.format(EIMP_URL, options.agentId);
    };

    Plant.prototype.register = function(onRegistered, onFailedRegistering) {
        this.log("Registering plant " + this._model.name);
        var queryString = querystring.stringify({register: true});
        var url = this.agentUrl.concat(queryString);

        var self = this;
        request.post(url, function(err, resp, body) {
            if(err || resp.statusCode != 200) {
                self.log("Failed to register plant: " + self._model.name + " Err: " + err + " Code: " + resp.statusCode);
                onFailedRegistering(self);
            } else if(resp.statusCode == 200){
                self.log("Successfully registered plant: " + self._model.name);
                onRegistered(self);
            }
        });
    };

    Plant.prototype.pause = function() {
        if(this.interval != null) {
            clearInterval(this.interval);
            setTimeout(this.startTimer.bind(this), 1000*60);
        }
    };

    Plant.prototype.startTimer = function() {
        if(this.interval != null) {
            return;
        }

        // Immediately get the state.
        this.getState();

        //Start a timer to fetch the state
        var self = this;
        this.interval = setInterval(function() {
            self.getState();
        }, INTERVAL);
    };

    Plant.prototype.getState = function(cb) {
        var queryString = querystring.stringify({ all: 'read'});
        var url = this.agentUrl + queryString;
        var self = this;

        //Fetch the water and light levels from eImp
        self.log("TRACE - before getState request");
        request({url: url, timeout:2500}, function(err, resp, body) {
            self.log("TRACE - on getState response: " + body);
            if (err) {
                self.log("Error reading sensors from eimp: " + err);
                self.updateSensorsWithNoData();
            } else if (resp.statusCode == 404) {
                self.log("Error - device offline: " + body);
                self.updateSensorsWithNoData();
            } else if (resp.statusCode != 200) {
                self.log("Error: " + body);
                self.updateSensorsWithNoData();
            } else {
                if(self.isOnline == false) {
                    self.isOnline = true;
                    self.syncAlerts();
                }

                if (typeof body === "string" && body.indexOf("Rate limit exceeded") > -1) {
                  //Stop and start a little bit later.
                  self.log("Rate limit exceeded, pausing for a minute.");
                  self.pause();
                }

                if (typeof body === "string") {
                  try {
                      body = JSON.parse(body);
                  } catch(e) {
                      self.log(e);
                      return;
                  }
                }

              body.timestamp = (new Date()).getTime();
              self._lightcontroller.pushSensorData(body.light);
              if (self._model.getCurrentLight() == undefined) {
                  var lightSensorPayload = {timestamp: body.timestamp, light: self._lightcontroller.getCurrentPercentage()};
                  self.updateModel(lightSensorPayload);
              }

              self._watercontroller.pushSensorData(body.water);
              if (self._model.getCurrentWater() == undefined) {
                  var waterSensorPayload = {timestamp: body.timestamp, water: self._watercontroller.getCurrentPercentage()};
                  self.updateModel(waterSensorPayload);
              }
            }
        });
    };

    Plant.prototype.updateSensorsWithNoData = function() {
        this.updateModel({timestamp: Date.now(), light: 0});
        this.updateModel({timestamp: Date.now(), water: 0});
    };

    Plant.prototype.checkForWatering = function() {
        //Check if plant has been watered lately
        var currentWaterValue = this._model.getCurrentWater().water;
        var trimmedWater = this._model.trimData("water", {start: 10, count: 10});
        var pastWaterValue = sensorutils.average(trimmedWater, "water");

        if (currentWaterValue - pastWaterValue >= WAS_WATERED_PERCENT) {
            this.social.say("Thanks for the water !");
            this.alerts.water = false;
            this.postAlerts();
            this.currentReport.wasWatered = true;
        }
    };

    Plant.prototype.log = function(text) {
        var logEntry = "[Plant:" + this._model.name + "] " + (new Date()).toString() + "-" + text;
        logger.logPlantMessage(logEntry);
    };

    Plant.prototype.shareStatus = function() {
        var timeString = (new Date()).toLocaleTimeString();
        var shareTweet = "You tickled me at " + timeString + " GMT. ";
        if(this._model.totalMinutesOfSunlight == 0) {
            shareTweet += "Why are you keeping me in the dark like that? ";
        } else {
            shareTweet += "I have had " + this._model.totalMinutesOfSunlight + " minutes of sunlight. ";
        }
        shareTweet += "I feel " + this._model.status.light.value + ", and " + this._model.status.water.value + ".";

        this.social.say(shareTweet);
    };

    Plant.prototype.postAlerts = function() {
        var queryString = "alert&".concat(querystring.stringify(this.alerts));
        var url = this.agentUrl.concat(queryString);

        var self = this;
        request.post(url, function(err, resp, body) {
            if(err) {
                self.log("Failed to set alerts to the plant.");
            } else if (resp.statusCode != 200) {
                self.log("Failed to set alerts to the plant. Status Code: " + resp.statusCode);
            } else {
                self.log("Set alerts to the plant. Status Code: " + resp.statusCode);
            }
        });
    };

    Plant.prototype.syncAlerts = function() {
        var url = this.agentUrl.concat("alert");
        var self = this;
        request.get(url, function(err, resp, body) {
            // Need to synchronize. Server should always be on, so it is the master of alerts.
            if (err) {
                self.log("Error reading sensors from eimp.");
            } else if (!body) {
                self.log("Error reading from eimp: Undefined body.");
            } else if (body.error) {
                self.log(body.error);
            } else if (resp.statusCode != 200) {
                self.log(body + " Status Code: " + resp.statusCode);
            } else {
                if (typeof body === "string") {
                    try {
                        body = JSON.parse(body);
                    } catch(e) {
                        self.log(e);
                        return;
                    }
                }

                if(JSON.parse(body.light) != self.alerts.light || JSON.parse(body.water) != self.alerts.water) {
                    self.log("Discrepency with alerts. Updating imp cloud with latest imp alerts.");
                    self.postAlerts();
                }
            }
        });
    }

    Plant.prototype.analyzeTweetMessage = function(tweet) {
        var self = this;
        var text = tweet.text.toLowerCase();
        var canReply = false;
        var tweetReply = "@" + tweet.user.screen_name;

        if (text.indexOf("water") > -1) {
            //Someone is querying the water level
            tweetReply += ", " + self._model.status.water.description;
            canReply = true;
        } else if (text.indexOf("light") > -1 || text.indexOf("sun") > -1) {
            //Someone is querying the light level
            tweetReply += ", " + self._model.status.light.description;
            canReply = true;
        } else if (text.indexOf("how are you") > -1) {
            if(this.alerts.light || this.alerts.water) {
                tweetReply += ", I could be better.";
            } else {
                tweetReply += ", I am doing great!"
            }
            tweetReply += "I feel " + self._model.status.light.value + ", and " + self._model.status.water.value + ".";
            canReply = true;
        } else if (text.indexOf("hello") > -1 || text.indexOf("hi") > -1) {
            tweetReply = "@" + tweet.user.screen_name + ", hello, is it me you're looking for?!";
            canReply = true;
        } else if (text.indexOf("shrub") > -1 || text.indexOf("plant") > -1) {
            tweetReply = "@" + tweet.user.screen_name + ", i am not the shrub you are looking for.";
            canReply = true;
        }

        return canReply ? tweetReply : "";
    };

    Plant.prototype.cryForHelp = function() {
        if (!this.alerts.water) {
            this.log("Crying for help. My water level is critical.");
            this.alerts.water = true;
            this.postAlerts();
            this.currentReport.criedForHelp = true;
            var self = this;
            setTimeout(function() {
                this.alerts.water = false;
                this.postAlerts();
            }, 24*60*60*1000);
        }
    };

    Plant.prototype.finalizeHourlyReport = function() {
        var light = this._model.getAverageLight();
        var water = this._model.getAverageWater();
        var sunlightInMinutes = this._model.getSunlightInMinutes();

        this.currentReport.light = { average:light, status:this.getLightStatus(light).value };
        this.currentReport.water = { average:water, status:this.getWaterStatus(water).value };
        this.currentReport.sunlightInMinutes = sunlightInMinutes;
    };

    Plant.prototype.createReportForYesterday = function() {
        var report = new PlantReport(this._model.name)
        var reportsLength = this.hourlyReports.length;
        var totalMinutesOfSunlight = 0;
        var averageLight = 0;
        var averageWater = 0;
        var criedForHelp = false;
        var wasWatered = false;

        for (var i = 0; i < reportsLength; i++) {
            totalMinutesOfSunlight += this.hourlyReports[i].sunlightInMinutes;
            averageLight += this.hourlyReports[i].light.average;
            averageWater += this.hourlyReports[i].water.average;
            criedForHelp |= this.hourlyReports[i].criedForHelp;
            wasWatered |= this.hourlyReports[i].wasWatered;
        }

        averageLight = Math.ceil(averageLight / reportsLength);
        averageWater = Math.ceil(averageWater / reportsLength);
        report.light = { average:averageLight, status:this.getLightStatus(averageLight).value };
        report.water = { average:averageWater, status:this.getWaterStatus(averageWater).value };
        report.criedForHelp = criedForHelp;
        report.wasWatered = wasWatered;

        return report;
    };

    Plant.prototype.updateModel = function(payload) {
        if(payload.light != undefined) {
            this._model.pushLight(payload);
            this.updateLightStatus();
        } else if(payload.water != undefined) {
            this._model.pushWater(payload);
            this.updateWaterStatus();
        } else {
            this.log("Unsure what sort of payload we have: " + payload.toString());
        }
    };

    Plant.prototype.getLight = function(recordCount) {
        var range = { start: 0, count: recordCount };
        return this._model.trimData("light", range);
    };

    Plant.prototype.getLightStatus = function(light) {
        var status;
        if (light >= constants.LIGHT.SUNNY.threshold) {
            status = {
                description: constants.LIGHT.SUNNY.description,
                value: constants.LIGHT.SUNNY.value
            };
        } else if (light >= constants.LIGHT.CLOUDY.threshold) {
            status =  {
                description: constants.LIGHT.CLOUDY.description,
                value: constants.LIGHT.CLOUDY.value
            };
        } else {
            status = {
                description: constants.LIGHT.DARK.description,
                value: constants.LIGHT.DARK.value
            };
        }
        return status;
    }

    Plant.prototype.updateLightStatus = function() {
        // DAN: cringe - I don't care about the timestamp
        var light = this._model.getCurrentLight().light;
        this._model.status["light"] = this.getLightStatus(light);
        this.log("Updated light status to: " + this._model.status["light"].value);
    };

    Plant.prototype.getWater = function(recordCount) {
        var range = { start: 0, count: recordCount };
        return this._model.trimData("water", range);
    };

    Plant.prototype.getWaterStatus = function(water) {
        var status;
        if (water >= constants.WATER.WET.threshold) {
            status = {
                description: constants.WATER.WET.description,
                value: constants.WATER.WET.value
            };
        } else if (water >= constants.WATER.HUMID.threshold) {
            status = {
                description: constants.WATER.HUMID.description,
                value: constants.WATER.HUMID.value
            };
        } else if (water >= constants.WATER.DRY.threshold) {
            status = {
                description: constants.WATER.DRY.description,
                value: constants.WATER.DRY.value
            };
        } else {
            status = {
                description: constants.WATER.CRITICAL.description,
                value: constants.WATER.CRITICAL.value
            };
        }
        return status;
    };

    Plant.prototype.updateWaterStatus = function () {
        // DAN: cringe - I don't care about the timestamp
        var water = this._model.getCurrentWater().water;
        this._model.status["water"] = this.getWaterStatus(water);
        this.log("Updated water status to: " + this._model.status["water"].value);
    };

    return Plant;
})();

module.exports = Plant;
