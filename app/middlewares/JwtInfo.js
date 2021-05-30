let jwt = require("jsonwebtoken");
let logger=require("../helpers/Logger");
module.exports = function (req, res, next) {

    let token = req.headers['token'];
    logger.info("checking jwt...");
    jwt.verify(token, _config("jwt.secret"),
        { expiresIn: _config("jwt.expires") }, function (error, decoded) {

            //if (error){

            //   return next(error);
            // }
            //if (!decoded  ) return res.forbidden();

            // logger.info(decoded.status+" user id ...."+decoded._id);
            if (decoded) {
                req.userid = decoded._id;
            }

            next();

        });

};
