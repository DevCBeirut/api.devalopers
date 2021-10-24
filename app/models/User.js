let mongoose = require("mongoose");
const mongooseLeanVirtual = require("mongoose-lean-virtuals");
let bcrypt = require("bcrypt");
const validator = require("validator");
const { toJSON, paginate } = require("./plugins");
let mongoosastic = require('mongoosastic');

let schema = mongoose.Schema(
  {
    first: {
      type: String,
      default: "", es_indexed:true 
    },
    last: {
      type: String,
      default: "", es_indexed:true 
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email");
        }
      },
    },

    password: {
      type: String,
      required: true,
    },

    activationcode: {
      type: Number,
      default: 0, //
    },
    status: {
      type: Number,
      default: 1, // 0 not verified , 1 verified
    },
    picture: {
      type: String,
      default: "profile.png",
    },

    accounttype: {
      type: String,
      default: "developer",
      index: true,
    },
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "talenttype",
    },
    skills: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "skill",
      default: [],
    },
    languages: {
      type: [Object],
      default: [],
    },
    company: {
      type: [Object],
      default: [],
    },
    education: {
      type: [Object],
      default: [], es_indexed:true 
    },
    exp: {
      type: [Object],
      default: [],
    },
    location: {
      type: String,
      default: "Beirut,Lebanon",
    },
    cv: {
      type: String,
      default: "",
    },
    cvrealfilename: {
      type: String,
      default: "",
    },
    about: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      default: "",
    },
    cover: {
      type: String,
      default: "",
    },
    rate: {
      type: String,
      default: "-",
    },
    description: {
      type: String,
      default: "",
    },
    views: {
      type: Number,
      default: 0,
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
    isonline: {
      type: Boolean,
      default: false,
    },
    isloggedin: {
      type: Boolean,
      default: false,
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
    lang: {
      type: String,
      default: "en",
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

schema.index({'$**':'text'});

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
  let info = await User.findById(id).exec();
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

schema.virtual("fullcv").get(function () {
  let fullcv = "";
  if (this.cv.length > 2) {
    fullcv = _config("app.imageurl") + this.cv;
  }
  return fullcv;
});
schema.virtual("name").get(function () {
  return this.first + " " + this.last;
});

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
schema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

// Plugin must be *after* virtuals
schema.plugin(mongooseLeanVirtual);

schema.set("toObject", { getters: true, virtuals: true });
schema.set("toJSON", { getters: true, virtuals: true });
schema.plugin(paginate);


schema.plugin(mongoosastic, {  
  host:process.env.elastichost,
  port: process.env.elasticport,
  protocol: process.env.elasticprotocol,
  auth: process.env.elasticccredentials
});

const collectionname = "user";
module.exports = mongoose.model(collectionname, schema, collectionname);
