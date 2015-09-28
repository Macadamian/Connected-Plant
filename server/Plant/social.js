var twit = require("twit");
var EventEmitter = require("events").EventEmitter;
var constants = require("../constants.js");

// This is all the tweeting functionality of the plant.
// It will listen to, and tweet things. Abstracts the twitter API from the plant's controller.
var SocialPlant = (function() {
    function SocialPlant() {
        this.tweets = [];
        this._twitter = {};
        this.T = null;
        this._callback = null;
        this._stream = null;
    };

    var util = require("util");
    util.inherits(SocialPlant, EventEmitter);

    SocialPlant.prototype.setTwitterConfig = function(options) {
        this._twitter = {};
        this._twitter.handle = options.handle;
        this._twitter.keys = options.keys;
        this._twitter.cb = options.handler;
    };

    SocialPlant.prototype.stopListening = function() {
        if(this.T !== null) {
            this._stream.removeListener("tweet", this._callback);
            this._stream = null;
            this.T = null;
            this._callback = null;
        }
    };

    SocialPlant.prototype.listenToTwitter = function() {
        var self = this;

        var t = new twit(this._twitter.keys);
        this.T = t;

        var self = this;
        this._callback = function (tweet) {
            self.tweets.push(tweet);
            self.emit(constants.MENTIONNED_ON_TWITTER, tweet);
            self._twitter.cb(tweet);
        };

        this._stream = t.stream("statuses/filter", {track: this._twitter.handle});
        this._stream.on("tweet", this._callback);
    };

    SocialPlant.prototype.say = function(text) {
        var self = this;
        text += " #IoT613";
        this.T.post("statuses/update", {status: text}, function(err, data, response) {
            if (err) {
                console.log(err);
                return;
            }
            self.lastStatus = text;
            self._twitter.cb(data);
        });
    };

    return SocialPlant;
})();

module.exports = SocialPlant;
