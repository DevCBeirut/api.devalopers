let jwt = require("jsonwebtoken");
let UserHelper = require("../helpers/UserHelper");
module.exports = async function (req, res, next) {

    let token = req.headers['token'];
    const timeout = await UserHelper.getSessionTimeout();

    console.log("checking jwt...");
    jwt.verify(token, _config("jwt.secret"),
        { expiresIn: timeout }, async function (error, decoded) {

            if (error) return next(error);
            if (!decoded || decoded.status === 0) {
                console.log("forbidden");
                return res.forbidden();
            }


            const userid = decoded._id;
            // check if not active anymoree
            // console.log("user id ...."+JSON.stringify(decoded._id))
            // console.log("user id ...."+userid);
            req.userid = userid;
            next();

        });

};
