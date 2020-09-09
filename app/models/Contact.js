let mongoose = require("mongoose");
const mongooseLeanVirtual = require('mongoose-lean-virtuals');


let schema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        lowercase: true,
    },
    message: {
        type: String,
        default: ""
    },
    status: {
        type: Number,
        default: 1 // 0 not verified , 1 verified
    },
    lastlogin: {
        type: Date,
    },

}, {
    versionKey: false,
    timestamps: true
}
);



// Plugin must be *after* virtuals
schema.plugin(mongooseLeanVirtual);

schema.set('toObject', { getters: true, virtuals: true });
schema.set('toJSON', { getters: true, virtuals: true });

const collectionname = "contact"
module.exports = mongoose.model(collectionname, schema, collectionname);
