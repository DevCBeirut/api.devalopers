let mongoose = require("mongoose");
let bcrypt = require("bcrypt");

let schema = mongoose.Schema({
    full_name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        defalut: ""
    },
    deleted: {
        type: Boolean,
        default: false
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: Number,
        default: 1 // 0 not verified , 1 verified
    },
    comments: {
        type: String,
        default: ""
    },
    managertype: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'managertype',
    },

    lang: {
        type: String,
        default: 'en'
    },
    lastlogin: {
        type: Date
    }

}, {
    versionKey: false,
    timestamps: true
}
);

schema.pre('save', function (next) {

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

/**
 * Compare raw and encrypted password
 * @param password
 * @param callback
 */
schema.methods.comparePassword = async function (password, callback) {

    // header already sent
    const match = await bcrypt.compare(password, this.password);
    if (match) {
        callback(true);
    } else {
        callback(false);
    }
};





schema.set('toObject', { getters: true, virtuals: true });
schema.set('toJSON', { getters: true, virtuals: true });

const collectionname = "manager"
module.exports = mongoose.model(collectionname, schema, collectionname);
