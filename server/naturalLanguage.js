/**
 * This is the natural language processing module
 * right now, it's added to the server so we can train it
 **/
var fs = require("fs");
var bodyParser = require('body-parser');

function NaturalLanguage(app) {
    app.use(bodyParser.urlencoded({ extended: false }));
    var natural = require("natural");
    var server = app;

    var FILENAME = "plantLanguage.json";
    var classifier;

    fs.readFile(FILENAME, function(err, data) {
        if(err) {
            console.log(err);
        }
        if(err || data == "") {
            classifier = new natural.BayesClassifier();
            fs.writeFile(FILENAME, "");
            return;
        }
        natural.BayesClassifier.load(FILENAME, null, function(err, cls) {
            classifier = cls;
        });
    });

    //Add the listeners to the server
    server.post("/language/train", function(req, res) {
        var body = req.body;
        var question = body.question;
        var category = body.category;
        if (!question || !category) {
            res.status(500).send("Missing arguments");
            return;
        }
        classifier.addDocument(question, category);
        classifier.train();

        classifier.save(FILENAME);

        res.status(200).send({success: 1});
    });

    server.get("/language/saved", function(req, res) {
        fs.readFile(FILENAME, function (err, data) {
            if (err) {
                console.log(err);
                return;
            }
            res.status(200).send(data);
        });
    });

    server.post("/language/categorize", function (req, res) {
        var question = req.body.question;
        console.log("got question", question);
        res.status(200).send({category: classifier.classify(question)});
    });

}

module.exports = NaturalLanguage;