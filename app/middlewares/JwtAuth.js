let jwt = require("jsonwebtoken");
let UserHelper = require("../helpers/UserHelper");
let logger=require("../helpers/Logger");
module.exports = async function (req, res, next) {

    let token = req.headers['token'];
    const timeout = await UserHelper.getSessionTimeout();

    logger.info("checking jwt...");
    jwt.verify(token, _config("jwt.secret"),
        { expiresIn: timeout }, async function (error, decoded) {

            if (error) return next(error);
            if (!decoded || decoded.status === 0) {
                logger.info("forbidden");
                return res.forbidden();
            }


            const userid = decoded._id;
            // check if not active anymoree
            // logger.info("user id ...."+JSON.stringify(decoded._id))
            // logger.info("user id ...."+userid);
            req.userid = userid;
            next();

        });

};
