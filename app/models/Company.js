let mongoose = require("mongoose");
const mongooseLeanVirtual = require("mongoose-lean-virtuals");
let bcrypt = require("bcrypt");
const { toJSON, paginate } = require("./plugins");

let schema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
      // required: true,
      // unique: true
    },

    companyemail: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
      // required: true,
      // unique: true
    },
    password: {
      type: String,
      required: true,
    },
    activationcode: {
      type: Number,
      default: 0, //
    },
    accounttype: {
      type: String,
      default: "company",
    },

    address: {
      type: String,
      default: "",
    },
    status: {
      type: Number,
      default: 1, // 0 not verified , 1 verified
    },

    type: {
      type: String,
      default: "", // like IT industry
    },

    linkfb: {
      type: String,
      default: "",
    },
    linklinking: {
      type: String,
      default: "",
    },
    linkgithub: {
      type: String,
      default: "",
    },

    picture: {
      type: String,
      default: "company.png",
    },
    cover: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      default: "",
    },

    profileview: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    views: {
      type: Number,
      default: 0,
    },

    linkid: {
      type: String,
      default: "",
    },
    isgithubaccount: {
      type: Boolean,
      default: false,
    },
    githubid: {
      type: String,
      default: "",
    },
    githublogin: {
      type: String,
      default: "",
    },
    islinkaccount: {
      type: Boolean,
      default: false,
    },
    lastlogin: {
      type: Date,
    },
    isactive: {
      type: Boolean,
      default: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

schema.pre("save", function (next) {
  let user = this;

  // generate a salt

  if (user.isModified("password") || user.isNew) {
    bcrypt.genSalt(10, function (error, salt) {
      if (error) return next(error);

      // hash the password along with our new salt

      bcrypt.hash(user.password, salt, function (error, hash) {
        if (error) return next(error);

        // override the cleartext password with the hashed one

        user.password = hash;

        next(null, user);
      });
    });
  } else {
    next(null, user);
  }
});

schema.statics.updateView = async function (id) {
  let info = await Company.findById(id).exec();
  if (info) {
    info.views = info.views + 1;
    await info.save();
  }
};

/**
 * Compare raw and encrypted password
 * @param password
 * @param callback
 */
schema.methods.comparePassword = async function (password, callback) {
   // header already sent
  return await bcrypt.compare(password, this.password);
};
/**
 * Compare raw and encrypted password
 * @param password
 * @param callback
 */
schema.methods.compareRowPassword = function (password, callback) {
  if (password === this.password) {
    callback(null, true);
  } else {
    callback(null, false);
  }
};

schema.virtual("fullpicture").get(function () {
  let fullpicture = "";
  if (this.picture.length > 2) {
    fullpicture = _config("app.imageurl") + this.picture;
  }
  return fullpicture;
});

schema.virtual("fullcover").get(function () {
  let fullcover = "";
  if (this.cover.length > 2) {
    fullcover = _config("app.imageurl") + this.cover;
  }
  return fullcover;
});

// Plugin must be *after* virtuals
schema.plugin(mongooseLeanVirtual);
schema.plugin(paginate);

schema.set("toObject", { getters: true, virtuals: true });
schema.set("toJSON", { getters: true, virtuals: true });

const collectionname = "company";
module.exports = mongoose.model(collectionname, schema, collectionname);
