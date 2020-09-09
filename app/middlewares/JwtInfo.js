let jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {

    let token = req.headers['token'];
    console.log("checking jwt...");
    jwt.verify(token, _config("jwt.secret"),
        { expiresIn: _config("jwt.expires") }, function (error, decoded) {

            //if (error){

            //   return next(error);
            // }
            //if (!decoded  ) return res.forbidden();

            // console.log(decoded.status+" user id ...."+decoded._id);
            if (decoded) {
                req.userid = decoded._id;
            }

            next();

        });

};
