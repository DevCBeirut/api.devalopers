let passport = require("passport");
let logger=require("../helpers/Logger");

module.exports = function (req, res, next) {

    passport.authenticate('jwt', function (error, user) {
        logger.info("check authenticate " + user);
        if (error) return next(error);
        if (!user) return res.forbidden();

        next();

    })(req, res, next);

};
