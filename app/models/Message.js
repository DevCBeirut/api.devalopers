let mongoose = require("mongoose");

let schema = mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "company",
    },

    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "room",
    },
    status: {
      type: Number,
      default: 0, // 0 unread , 1 read
    },
    ownerisdev: {
      type: Boolean,
      default: true, // who is the message owner
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

schema.set("toObject", { getters: true, virtuals: true });
schema.set("toJSON", { getters: true, virtuals: true });

const collectionname = "message";
module.exports = mongoose.model(collectionname, schema, collectionname);
