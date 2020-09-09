let router = require("express").Router();

router.get("/", TestController.index);

//router.get("/logout", AuthController.logout);

//router.post("/profile", HomeController.profile);

//router.get("/profile", SessionAuth, HomeController.profile);
router.get("/journey", TestController.journey);



router.get("/verifyemail/:token", UserController.verifyemail);
router.get("/resetpassword/:token", UserController.resetpassword);
router.post("/resetnewpassword", UserController.resetnewpassword);


module.exports = router;
