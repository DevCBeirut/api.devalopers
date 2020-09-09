let passport = require("passport");

module.exports = function (req, res, next) {

    passport.authenticate('jwt', function (error, user) {
        console.log("check authenticate " + user);
        if (error) return next(error);
        if (!user) return res.forbidden();

        next();

    })(req, res, next);

};
