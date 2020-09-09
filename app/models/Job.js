let mongoose = require("mongoose");

const mongooseLeanVirtual = require('mongoose-lean-virtuals');

let schema = mongoose.Schema({
    name: {
        type: String,
        default: ""
    },
    description: {
        type: String,
        default: ""
    },
    location: {
        type: String,
        default: ""
    },
    acceptremote: {
        type: Boolean,
        default: false
    },
    toduration: {
        type: Date,
        default: Date.now
    },
    fromduration: {
        type: Date,
        default: Date.now
    },
    jobtype: {
        type: String,
        default: ""
    },
    whoview: {
        type: String,
        default: "Everyone"
    },
    education: {
        type: String,
        default: ""
    },
    skills: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'skill',
        default: []
    },
    yearsexp: {
        type: String,
        default: "1"
    },
    salary: {
        type: String,
        default: "0"
    },
    questionlist: {
        type: [Object],
        default: []
    },
    file: {
        type: String,
        default: ""
    },

    status: {
        type: Number,
        default: 1
    },
    minsalary: {
        type: Number,
        default: 0
    },
    maxsalary: {
        type: Number,
        default: 0
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'company',
    },

}, {
    versionKey: false,
    timestamps: true
}
);

const collectionname = "job";
schema.set('toObject', { getters: true, virtuals: true });
schema.set('toJSON', { getters: true, virtuals: true });



schema.virtual('fullfile').get(function () {
    let fullcv = "";
    if (this.file && this.file.length > 2) {
        fullcv = _config("app.imageurl") + this.file;
    }
    return fullcv;
});


// Plugin must be *after* virtuals
schema.plugin(mongooseLeanVirtual);

module.exports = mongoose.model(collectionname, schema, collectionname);
