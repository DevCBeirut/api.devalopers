let mongoose = require("mongoose");

let schema = mongoose.Schema({
    locationinterval: {
        type: Number,
        default: 10  // time in seconds
    },
    emailsupport: {
        type: String,
        default: ""
    },
    session: {
        type: Number,
        default: 6000  // expire in hours.
    },
    status: {
        type: Number,
        default: 1
    }
}, {
    versionKey: false,
    timestamps: true
}
);

schema.set('toObject', { getters: true, virtuals: true });
schema.set('toJSON', { getters: true, virtuals: true });
module.exports = mongoose.model("settings", schema, "settings");
