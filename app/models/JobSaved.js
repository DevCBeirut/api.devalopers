let mongoose = require("mongoose");

const mongooseLeanVirtual = require('mongoose-lean-virtuals');

let schema = mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'job',
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', // dev
    },
    status: {
        type: Number,
        default: 1
    },


}, {
    versionKey: false,
    timestamps: true
}
);

const collectionname = "jobsaved";
schema.set('toObject', { getters: true, virtuals: true });
schema.set('toJSON', { getters: true, virtuals: true });




// Plugin must be *after* virtuals
schema.plugin(mongooseLeanVirtual);

module.exports = mongoose.model(collectionname, schema, collectionname);
