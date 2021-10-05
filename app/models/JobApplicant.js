let mongoose = require("mongoose");

const mongooseLeanVirtual = require("mongoose-lean-virtuals");

let schema = mongoose.Schema(
  {
    coverletter: {
      type: String,
      default: "",
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "job",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user", // dev
    },
    answers: {
      type: [Object],
      default: [], // dev
    },

    status: {
      type: String,
      default: "Pending",
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "company",
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const collectionname = "jobapplicant";
schema.set("toObject", { getters: true, virtuals: true });
schema.set("toJSON", { getters: true, virtuals: true });

// Plugin must be *after* virtuals
schema.plugin(mongooseLeanVirtual);

module.exports = mongoose.model(collectionname, schema, collectionname);
