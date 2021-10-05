let mongoose = require("mongoose");

let schema = mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
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

schema.statics.AddManager = async function (name = "Admin") {
  let data = new ManagerType();
  data.name = name;
  await data.save();
  return data._id;
};

schema.statics.Clear = async function (name = "Admin") {
  ManagerType.deleteMany().exec();
};

schema.set("toObject", { getters: true, virtuals: true });
schema.set("toJSON", { getters: true, virtuals: true });
module.exports = mongoose.model("managertype", schema, "managertype");
