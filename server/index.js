var express = require("express");
var app = express();
var server = require("http").Server(app);
var logger = require("./Logger");
var Plant = require("./Plant");
var natural = require("./naturalLanguage")(app);
var constants = require("./constants.js");
var bodyParser = require('body-parser');

var port = process.env.PORT || 3000;
var basePath = "/../client";

var defaultPlant = new Plant("office_shrub");
defaultPlant.setElectricImpConfig({
    agentId: ""
});
defaultPlant.social.setTwitterConfig({
    handle: "@your_handle_here",
    keys: {
        consumer_key: "",
        consumer_secret: "",
        access_token: "",
        access_token_secret: ""
    },
    handler: function() {}
});
defaultPlant.register(function(successPlant) {
    successPlant.init();
}, function(failurePlant) {
    //HACK: default plant is a hack, programmer don't care.
    console.log("Uh oh, something went wrong, the default plant didn't register.");
    failurePlant.init();
});

var plants = {
    "office_shrub": defaultPlant
};

app.use(express.static(__dirname + basePath));
app.use(bodyParser.urlencoded({ extended: false }));

//Register a new plant
app.post("/register", function(req, res) {
    var options = req.body;

    //Check for unique name
    var newPlant = {};
    if (plants[options.name] !== undefined) {
        console.log("Updating plant: " + options.name);
        newPlant = plants[options.name];
    } else {
        console.log("Creating a new plant.");
        newPlant = new Plant(options.name);
    }

    //HACK: Eeeew!
    //HACK: Figure out why the bodyParser parses JSON this way
    options.twitter = {
        keys: {
            access_token: options["twitter[keys][access_token]"],
            access_token_secret: options["twitter[keys][access_token_secret]"],
            consumer_key: options["twitter[keys][consumer_key]"],
            consumer_secret: options["twitter[keys][consumer_secret]"]
        },
        handle: options["twitter[handle]"],
        handler: function() {}
    };
    options.eimp= {
        agentId: options["eimp[agentId]"]
    };

    newPlant.setElectricImpConfig(options.eimp);
    newPlant.social.setTwitterConfig(options.twitter);
    newPlant.register(function(successPlant) {
        successPlant.init();
        plants[options.name] = successPlant;
        res.status(200).send("OK");
    }, function(failurePlant) {
        res.status(500).send("Failed to Register Plant to the Imp Cloud");
    });
});

app.get("/plants", function(req, res) {
    var plantsArray = [];
    for (var key in plants) {
        plantsArray.push(key);
    }
    res.status(200).send(plantsArray);
});

app.get("/:NAME/light", function(req, res) {
    var plant = plants[req.params.NAME];
    var numberOfRecords = req.query.num || 1;

    if (plant != undefined) {
        var output = { name: plant.getName(), light: plant.getLight(numberOfRecords)};
        res.status(200).send(output);
    } else {
        res.status(404).send("Device not found.");
    }
});

app.get("/:NAME/water", function(req, res) {
    var plant = plants[req.params.NAME];
    var format = req.query.format;
    var numberOfRecords = req.query.num || 1;

    if(plant !== undefined) {
        var output = { name: plant.getName(), water: plant.getWater(numberOfRecords)};
        res.status(200).send(output);
    } else {
        res.status(404).send("Device not found.");
    }
});

// TODO: eliminate? plant doesn't need the name, just to figure out if it is registered.
app.get("/:AGENTID/registered", function(req, res) {
    var agentId = req.params.AGENTID;
    var isRegistered = false;
    var plantName = "Unknown";

    for (var key in plants) {
        if(agentId == plants[key].getAgentId()) {
            plantName = key;
            isRegistered = true;
            break;
        }
    }
    res.status(200).send("{\"isRegistered\": " + (+isRegistered) + "}");
});

app.post("/:AGENTID/share", function(req, res) {
    var plant = null;
    var agentId = req.params.AGENTID;
    for (var key in plants) {
        if(agentId == plants[key].getAgentId()) {
            plant = plants[key];
            break;
        }
    }

    if(plant != null) {
        console.log("SHARE on a Button Press for plant: " + plant.getName());
        plant.shareStatus();
        res.status(200).send("OK");
    } else {
        res.status(404).send("Could not find plant.");
    }
});

app.get("/log", function(req, res) {
    logger.fetchPlantLogs(function(html) {
        res.status(200).send(html);
    }, function(err) {
        res.status(500).send(err);
    });
});

app.get("/crash", function(req, res) {
    logger.fetchCrashLogs(function(html) {
        res.status(200).send(html);
    }, function(err) {
        res.status(500).send(err);
    });
});

logger.init();
process.on('uncaughtException', function (err) {
    var crashMessage = (new Date()).toString() + " Message: " + err + " Stack: " + err.stack;
    logger.logCrash(crashMessage, function() {
        // process.exit(1);
    });
});

process.on('SIGHUP', function() {
  logger.logPlantMessage("Exiting process");
  process.exit();
});

server.listen(port);
console.log("Server listening on port " + port + ", serving folder " + basePath);
