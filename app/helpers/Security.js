let jwt = require("jsonwebtoken");
let UserHelper = require("../helpers/UserHelper");
const Cryptr = require('cryptr');

module.exports = {

    generateToken: async function (userid, full_name, status, type = "user", ismanager = false) {

        const timeout = _config("jwt.expires");
        return jwt.sign(
            { _id: userid, full_name: full_name, status: status, type: type, ismanager: ismanager },
            _config("jwt.secret"),
            { expiresIn: timeout }
        );
    },

    base64encode: function (input) {
        return Buffer.from(input).toString('base64')
    },

    base64decode: function (input) {
        return Buffer.from(input, 'base64').toString('ascii');
    },


    // https://hackernoon.com/how-to-use-environment-variables-keep-your-secret-keys-safe-secure-8b1a7877d69c
    // AED 265 bit
    encrypt: function (data) {
        const cryptr = new Cryptr(process.env.CRYPTR_KEY || _config("app.cryptrkey"));
        return cryptr.encrypt(data);
    },
    decrypt: function (encryptedString) {
        const cryptr = new Cryptr(process.env.CRYPTR_KEY || _config("app.cryptrkey"));
        return cryptr.decrypt(encryptedString);
    }


};