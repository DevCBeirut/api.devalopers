let router = require("express").Router();

///////////////// ON BOARDING

router.post("/user/save", UserController.createuser);
router.post("/user/verify", UserController.verifyuser);
router.post("/user/login", UserController.userlogin);
router.get("/user/logout", JwtAuth, UserController.userlogout);
router.post("/user/deactivate", JwtAuth, UserController.userdeactivate);
router.post("/user/activate", JwtAuth, UserController.useractivate);

router.post("/user/forgot", UserController.forgotpassword);
router.post("/user/reset", UserController.resetnewpassword);

router.post("/user/update", JwtAuth, UserController.updateprofile);
router.post("/user/updatecover", JwtAuth, UserController.updateprofilecover);
router.post("/user/updateabout", JwtAuth, UserController.updateabout);
router.post("/user/updateskills", JwtAuth, UserController.updateskills);
router.post("/user/updatecv", JwtAuth, UserController.updatecv);
router.post("/user/updatelang", JwtAuth, UserController.updatelang);
router.post("/user/deletelang", JwtAuth, UserController.deletelang);

router.post("/user/updateworkexp", JwtAuth, UserController.updateworkexp);
router.post("/user/deletework", JwtAuth, UserController.deletework);

router.post("/user/updateeducation", JwtAuth, UserController.updateeducation);
router.post("/user/deleteschool", JwtAuth, UserController.deleteeducation);

router.get("/user/info/:id", JwtAuth, UserController.userinfo);
router.post("/user/changepass", JwtAuth, UserController.changepass);
router.get("/user/dashboard", JwtAuth, UserController.userdashboard);
router.get("/user/savejob/:id", JwtAuth, UserController.savejobapplicant);
router.get("/user/my/saved", JwtAuth, UserController.mysavedjob);
router.get("/user/my/application", JwtAuth, UserController.myapplication);

router.post("/user/queryusers", UserController.queryUsers);
router.post("/user/searchusers", UserController.searchUsers);

// company
router.post("/company/save", CompanyController.createcompany);
router.post(
  "/company/updatecover",
  JwtAuth,
  CompanyController.updateprofilecover
);

// home front end
router.get("/home/frontend", HomeController.frontend);
router.post("/home/contactus", HomeController.contactus);
router.get("/skills/list", HomeController.allskills);

router.get("/countries/list", HomeController.allCountries);
router.get("/cities/list", HomeController.allCities);
router.get("/country/cities", HomeController.countryCities);

router.get("/company/countries", CompanyController.companyCountries);
router.get("/Job/currencies", CompanyController.jobCurrencies);

router.get("/dev/list/:page", HomeController.alldev);
router.get("/talenttype/list", HomeController.talenttypelist);

router.get("/company/my/job", JwtAuth, HomeController.mycompanyjob);

router.get("/company/info/:id", JwtInfo, CompanyController.companyinfo);
router.get("/company/dashboard", JwtAuth, CompanyController.companydashboard);
router.post("/company/update", JwtAuth, CompanyController.companyupdatenoimg);
router.post("/company/updateimg", JwtAuth, CompanyController.companyimage);

router.post("/company/queryCompanies", CompanyController.queryCompanies);
router.post("/company/queryJobs", CompanyController.queryJobs);

router.get("/job/info/:id", JwtInfo, HomeController.jobinfo);
router.post("/job/save", JwtAuth, CompanyController.savejob);
router.post(
  "/job/applicant/submit",
  JwtAuth,
  CompanyController.saveapplicantjob
);
router.post(
  "/job/messages/save",
  JwtAuth,
  CompanyController.saveapplicantmessage
);
router.get("/job/messages/:contactid", JwtAuth, CompanyController.allmessages);
router.get("/job/messages", JwtAuth, CompanyController.allmessages);
router.get("/job/applicant/list", JwtAuth, CompanyController.companyapplicant);
router.post("/job/search", JwtInfo, CompanyController.jobsearch);
router.post("/job/query", JwtInfo, CompanyController.jobtextsearch);

router.get("/job/delete/:id", JwtAuth, CompanyController.deletejob);
router.post(
  "/job/applicant/updatestatus",
  JwtInfo,
  CompanyController.updateapplicantstatus
);

router.post("/social/github/login", CompanyController.githublogin);
router.post("/social/linkedin/login", CompanyController.linkedinlogin);
module.exports = router;
