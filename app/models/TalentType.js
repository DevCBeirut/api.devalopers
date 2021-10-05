let mongoose = require("mongoose");

let schema = mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },
    lang: {
      type: String,
      default: "en",
    },
    order: {
      type: Number,
      default: 0,
    },
    status: {
      type: Number,
      default: 1,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

schema.set("toObject", { getters: true, virtuals: true });
schema.set("toJSON", { getters: true, virtuals: true });
module.exports = mongoose.model("talenttype", schema, "talenttype");
