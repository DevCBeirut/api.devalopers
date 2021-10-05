let mongoose = require("mongoose");

let schema = mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      default: "Development",
    },
    description: {
      type: String,
      default: "", // expire in hours.
    },
    status: {
      type: Number,
      default: 1,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

schema.statics.updateCount = async function (id) {
  // logger.info("updateCount ",id)
  let info = await Skill.findById(id).exec();
  if (info) {
    info.count = info.count + 1;
    await info.save();
  }
};
schema.set("toObject", { getters: true, virtuals: true });
schema.set("toJSON", { getters: true, virtuals: true });
module.exports = mongoose.model("skill", schema, "skill");
