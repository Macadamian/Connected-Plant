module.exports = {
    SENSOR_UPDATE: "sensor-update",
    MENTIONNED_ON_TWITTER: "mentionned-on-twitter",
    RAW: "raw",
    LIGHT: {
        SUNNY: {
            value: "sunny",
            description: "I'm baking in light. Taking some of that CO2 and converting it to the O2 you need.",
            threshold: 80
        },
        CLOUDY: {
            value: "cloudy",
            description: "Am I indoors? This isn't great for me.",
            threshold: 30
        },
        DARK: {
            value: "dark",
            description: "Is it night? Now consuming some of the O2 I produce.",
            threshold: 15
        },
        UNKNOWN: {
            value: "unknown",
            description: "I'm not quite sure how much light I have. Are you sure I'm plugged?",
            threshold: -1
        }
    },
    WATER: {
        WET: {
            value: "wet",
            description: "I need water, but I'm not an aquatic plant, please stop!",
            threshold: 80
        },
        HUMID: {
            value: "humid",
            description: "My soil is moist, and so am I.",
            threshold: 40,
        },
        DRY: {
            value: "dry",
            description: "I'm beginning to feel thirsty, remember to water me soon.",
            threshold: 15
        },
        CRITICAL: {
            value: "very dry",
            description: "Please water me as soon as possible.  I'm about to die.",
            threshold: 0
        },
        UNKNOWN: {
            value: "unknown",
            description: "I'm not quite sure how much water I have. Are you sure I'm plugged?",
            threshold: -1
        }
    },
};
