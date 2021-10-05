/**
 * UsersController
 * @description :: Server-side logic for managing users
 */
let jwt = require("jsonwebtoken");
let _ = require("lodash");
let Utils = require("../helpers/Utils");
let Security = require("../helpers/Security");
let logger = require("../helpers/Logger");
let Response = require("../helpers/Response");
let UserHelper = require("../helpers/UserHelper");
let ImageManager = require("../helpers/ImageManager");
const FormData = require("form-data");
const fetch = require("node-fetch");
module.exports = {
  /**
   * Create a new user
   * @param req
   * @param res
   * @returns {*}
   */
  createcompany: async function (req, res) {
    let user = new Company(req.body);

    user.companyemail = req.body.email;
    let count = await Company.countDocuments({ email: req.body.email }).exec();
    if (count > 0) {
      return Response.notOk(res, "Email already found");
    }
    count = await Company.countDocuments({ name: req.body.name }).exec();
    if (count > 0) {
      return Response.notOk(res, "Name already found");
    }
    count = await User.countDocuments({ email: req.body.email }).exec();
    if (count > 0) {
      return Response.notOk(res, "Email already found");
    }

    // const random = Utils.randomnumber();
    // user.activationcode = random;
    // UserHelper.sendVerificationAccount(user.phone,random);

    user.save(async function (error, user) {
      if (error) return res.serverError("data error", error);
      //await  ImageManager.uploadimagebase64(user._id,req);
      //const msg = "Please enter this activation core : "+random+" to verify your account";
      // EmailService.send(user.email, "Activate YOUR Account Now", msg);
      //logger.info(user)
      return Response.ok(res, {
        msg: "Please Verify your account",
        token: await Security.generateToken(user._id, user.name, user.status),
        expires: await UserHelper.getSessionTimeout(),
      });
    });
  },
  companyCountries: async function (req, res) {
    const data = await Company.distinct("location");
    return Response.ok(res, data);
  },
  jobCurrencies: async function (req, res) {
    const data = await Job.distinct("currency");
    return Response.ok(res, data);
  },
  savejob: async function (req, res) {
    logger.info("savejob");
    let userid = req.userid;
    const data = req.body;
    const file = await ImageManager.uploadbase64(req, "file");
    const skills = data.skills;

    let id = data._id;
    const questionlist = data.questionlist;
    let newdata = {};

    if (id && id.length > 2) {
      newdata = await Job.findById(id).exec();
    } else {
      newdata = new Job();
    }
    newdata.company = userid;
    newdata.name = data.name;
    newdata.description = data.description;
    newdata.location = data.location;
    newdata.city = data.city;
    newdata.yearsexp = data.yearsexp;
    if (data.whoview && data.whoview.length > 1) {
      newdata.whoview = data.whoview;
    }

    newdata.jobtype = data.jobtype;
    newdata.toduration = data.toduration;
    newdata.fromduration = data.fromduration;
    newdata.acceptremote = data.acceptremote;
    newdata.education = data.education;

    if (data.realfileattachedname && data.realfileattachedname.length > 2) {
      newdata.realfileattachedname = data.realfileattachedname;
    }
    newdata.salary = data.salary;
    newdata.currency = data.currency;
    newdata.skills = skills;
    newdata.questionlist = questionlist;
    if (file) {
      newdata.file = file;
    }

    let maxsalary = -1;
    let minsalary = -1;
    if (data.salary != "No Salary" && data.salary.length > 1) {
      let salary_range = data.salary.split(" - ");
      if (salary_range.length > 1) {
        minsalary = salary_range[0].substring(1);
        maxsalary = salary_range[1].substring(1);
      } else {
        minsalary = data.salary.substring(1, data.salary.length - 1);
        maxsalary = minsalary;
      }
    }
    newdata.minsalary = minsalary;
    newdata.maxsalary = maxsalary;
    await newdata.save();

    return Response.ok(res);
  },

  allmessages: async function (req, res) {
    const contactid = req.params.contactid;
    let userid = req.userid;

    if (contactid) {
      await Room.createRoom(contactid, userid);
    }
    let roomcondition = { userid: userid._id };
    let isdev = true;
    let userinfo = await User.findById(userid).sort({ $natural: -1 }).exec();
    if (!userinfo || !userinfo.name) {
      roomcondition = { companyid: userid._id };
      isdev = false;
    }

    let allrooms = await Room.find(roomcondition)
      .populate("user company job")
      .sort({ $natural: -1 })
      .lean({ virtuals: true })
      .exec();

    for (let i = 0; i < allrooms.length; i++) {
      allrooms[i].message = [];
      let message = await Message.find({ room: allrooms[i]._id })
        .populate("user company")
        .exec();
      if (message && message.length > 0) {
        allrooms[i].message = message;
      }
      message.map(async (onemsg) => {
        if (onemsg.company && isdev) {
          onemsg.status = 1;
        }
        if (onemsg.user && !isdev) {
          onemsg.status = 1;
        }
        await onemsg.save();
      });
    }

    return Response.ok(res, {
      rooms: allrooms,
    });
  },

  saveapplicantmessage: async function (req, res) {
    logger.info("saveapplicantjob");

    const message = req.body.message;
    const roomid = req.body.roomid;

    let isdev = true;
    let userid = req.userid;
    let userinfo = await User.findById(userid).sort({ $natural: -1 }).exec();
    let name = "";
    if (!userinfo || !userinfo.name) {
      userinfo = await Company.findById(userid).sort({ $natural: -1 }).exec();
      isdev = false;
    }

    let msg = new Message();
    if (isdev) {
      msg.user = userid;
    } else {
      msg.company = userid;
    }
    msg.text = message;
    msg.room = roomid;
    msg.ownerisdev = isdev;
    await msg.save();

    return Response.ok(res);
  },

  saveapplicantjob: async function (req, res) {
    logger.info("save applicant job");
    let userid = req.userid;
    const coverletter = req.body.coverletter;
    const jobid = req.body.jobid;
    const answerlist = req.body.answerlist;

    const userinfo = await User.findById(userid)
      .sort({ $natural: -1 })
      .lean()
      .exec();
    // check profile score, and cv
    if (userinfo && userinfo.cv.length < 3) {
      return Response.notOk(res, "Please Submit your CV before Apply");
    }
    //        if(userinfo){
    //            return Response.notOk(res,"Please add more information to your profile ");
    //        }
    const companyinfo = await Job.findById(jobid)
      .sort({ $natural: -1 })
      .lean()
      .exec();
    let newdata = new JobApplicant();
    newdata.coverletter = coverletter;
    newdata.job = jobid;
    newdata.user = userid;
    newdata.answers = answerlist;
    newdata.company = companyinfo.company;
    await newdata.save();
    Room.createRoom(userid, companyinfo.company, jobid);

    return Response.ok(res);
  },
  companyinfo: async function (req, res) {
    let companyid = req.params.id;
    let userid = req.userid;
    const companyinfo = await Company.findById(companyid)
      .sort({ $natural: -1 })
      .exec();
    let today = new Date(new Date().setDate(new Date().getDate() - 1));

    const activejobs = await Job.find({
      company: companyid,
      toduration: { $gt: today },
    })
      .populate("user company")
      .sort({ $natural: -1 })
      .limit(4)
      .lean()
      .exec();
    let previousjob = await Job.find({
      company: companyid,
      toduration: { $lt: today },
    })
      .populate("user company")
      .sort({ $natural: -1 })
      .limit(4)
      .lean()
      .exec();

    const msgcount = 1;

    let profileprogress = await UserHelper.calculateProfileProgress(
      companyinfo,
      false
    );
    if (!userid) {
      profileprogress = {};
      previousjob = [];
    }
    let canedit = false;
    if (userid == companyinfo._id) {
      canedit = true;
    } else {
      await Company.updateView(companyid);
    }
    return Response.ok(res, {
      info: companyinfo,
      activejobs: activejobs,
      previousjob: previousjob,
      profileprogress: profileprogress,
      canedit: canedit,
      msgcount: msgcount,
    });
  },

  companydashboard: async function (req, res) {
    let companyid = req.userid;
    const companyinfo = await Company.findById(companyid)
      .sort({ $natural: -1 })
      .lean({ virtuals: true })
      .exec();

    let today = new Date(new Date().setDate(new Date().getDate() - 1));
    const countactivejobs = await Job.countDocuments({
      company: companyid,
      toduration: { $gt: today },
    })
      .sort({ $natural: -1 })
      .lean()
      .exec();
    const countapplicant = await JobApplicant.countDocuments({
      company: companyid,
    })
      .sort({ $natural: -1 })
      .lean({ virtuals: true })
      .exec();
    const lastestapplicant = await JobApplicant.find({ company: companyid })
      .populate("user job")
      .sort({ $natural: -1 })
      .limit(4)
      .lean({ virtuals: true })
      .exec();
    const mostactivecompanies = await UserHelper.mostactivecompanies();
    const mostsearchedskills = await Skill.find()
      .sort({ $natural: -1 })
      .limit(4)
      .lean()
      .exec();
    let countdev = await User.countDocuments({ status: 1 }).exec();
    let countcompany = await Company.countDocuments({ status: 1 }).exec();
    let countjob = await Job.countDocuments({ status: 1 }).exec();
    const statistics = {
      jobs: countjob,
      companies: countcompany,
      dev: countdev,
    };
    let profileprogress = await UserHelper.calculateProfileProgress(
      companyinfo,
      false
    );
    return Response.ok(res, {
      info: companyinfo,
      countactivejobs: countactivejobs,
      countapplicant: countapplicant,
      countprofileview: companyinfo.views,
      lastestapplicant: lastestapplicant,
      mostactivecompanies: mostactivecompanies,
      mostsearchedskills: mostsearchedskills,
      statistics: statistics,
      profileprogress: profileprogress,
    });
  },

  companyupdate: async function (req, res) {
    let companyid = req.userid;
    const data = await ImageManager.uploadimagebody(req, res);
    const name = data.name;
    const location = data.location;
    const website = data.website;
    const description = data.description;
    const type = data.type;
    const picture = data.picture;
    const companyemail = data.companyemail;
    const removepic = data.removepic;

    const country = data.country;
    const address = data.address;

    const linkfb = data.linkfb;
    const linklinking = data.linklinking;
    const linkgithub = data.linkgithub;

    let companyinfo = await Company.findById(companyid)
      .sort({ $natural: -1 })
      .exec();

    companyinfo.name = name;
    companyinfo.location = location;
    companyinfo.description = description;
    companyinfo.type = type;

    companyinfo.address = address;

    companyinfo.website = website;

    companyinfo.linkfb = linkfb;

    companyinfo.linklinking = linklinking;

    companyinfo.linkgithub = linkgithub;
    companyinfo.companyemail = companyemail;

    if (picture.length > 1) {
      companyinfo.picture = picture;
    }
    if (!picture && removepic) {
      companyinfo.picture = "";
    }

    await companyinfo.save();
    return Response.ok(res, {
      picture: companyinfo.fullpicture,
    });
  },

  companyapplicant: async function (req, res) {
    let companyid = req.userid;

    const data = await JobApplicant.find({ company: companyid })
      .populate({
        path: "user", // 1st level subdoc (get comments)
        populate: {
          // 2nd level subdoc (get users in comments)
          path: "type",
          // select: 'avatar name _id'// space separated (selected fields only)
        },
      })
      .populate("job")
      .sort({ $natural: -1 })
      .lean({ virtuals: true })
      .exec();
    for (let i = 0; i < data.length; i++) {
      let score = 0;
      if (
        data[i].user &&
        data[i].user.skills &&
        data[i].user.skills.length > 0
      ) {
        data[i].user.skills = await Skill.find({ _id: data[i].user.skills })
          .sort({ $natural: -1 })
          .lean()
          .exec();
      }
      data[i].user &&
        data[i].user.skills &&
        data[i].user.skills.map((item) => {
          let res = data[i].job.skills.find((e) => e == item._id.toString());
          if (res) {
            score = score + 1;
          }
        });
      // check skills count
      if (data[i].user) {
        data[i].user.skillsmatch = score + "/" + data[i].job.skills.length;
      }
    }
    return Response.ok(res, data);
  },

  deletejob: function (req, res) {
    const id = req.params.id;
    Job.findById(id, function (error, lang) {
      if (error) return res.serverError(error);
      if (!lang) return res.notFound();
      lang.remove(function (error) {
        if (error) return res.serverError(error);
        return res.ok();
      });
    });
  },
  githublogin: async function (req, res) {
    const { client_id, redirect_uri, client_secret, code, regtype } = req.body;

    //logger.info("githublogin server......",req.body)
    const data = new FormData();

    logger.info(regtype);
    //if(!regtype){
    //  return Response.notOk(res,"Login Error")
    //  }
    data.append("client_id", client_id);
    data.append("client_secret", client_secret);
    data.append("code", code);
    data.append("redirect_uri", redirect_uri);

    // Request to exchange code for an access token
    fetch(`https://github.com/login/oauth/access_token`, {
      method: "POST",
      body: data,
    })
      .then((response) => response.text())
      .then((paramsString) => {
        let params = new URLSearchParams(paramsString);
        const access_token = params.get("access_token");
        const scope = params.get("scope");
        const token_type = params.get("token_type");

        // Request to return data of a user that has been authenticated
        return fetch(
          `https://api.github.com/user?access_token=${access_token}&scope=${scope}&token_type=${token_type}`
        );
      })
      .then((response) => response.json())
      .then((response) => {
        //logger.info("ressss",response)
        // login user
        if (regtype == "login") {
          // login
          logger.info("login...");
          User.findOne(
            {
              githublogin: response.login,
              isgithubaccount: true,
              githubid: response.id,
            },
            async function (error, user) {
              if (!user) {
                Company.findOne(
                  {
                    githublogin: response.login,
                    isgithubaccount: true,
                    githubid: response.id,
                  },
                  async function (error, user) {
                    if (!user) {
                      return Response.notOk(res, "user not found");
                    } else {
                      return Response.ok(res, {
                        msgcount: 0,
                        userid: user._id,
                        picture: user.fullpicture,
                        accounttype: user.accounttype,
                        token: await Security.generateToken(
                          user._id,
                          user.name,
                          user.status
                        ),
                        expires: await UserHelper.getSessionTimeout(),
                      });
                    }
                  }
                );
              } else {
                return Response.ok(res, {
                  msgcount: msgcount,
                  userid: user._id,
                  picture: user.fullpicture,
                  accounttype: user.accounttype,
                  token: await Security.generateToken(
                    user._id,
                    user.name,
                    user.status
                  ),
                  expires: await UserHelper.getSessionTimeout(),
                });
              }
            }
          );
        } else if (regtype == "dev") {
          // check if already found
          User.findOne(
            {
              githublogin: response.login,
              isgithubaccount: true,
              githubid: response.id,
            },
            async function (error, user) {
              if (!user) {
                // create user
                let newdata = new User();
                newdata.name = response.login;
                newdata.password = response.id;

                newdata.githublogin = response.login;
                newdata.githubid = response.id;
                newdata.isgithubaccount = true;
                await newdata.save();
                return Response.ok(res, "User Registered");
              } else {
                return Response.notOk(res, "User already found");
              }
            }
          );
        } else {
          // check if already found
          Company.findOne(
            {
              githublogin: response.login,
              isgithubaccount: true,
              githubid: response.id,
            },
            async function (error, user) {
              if (!user) {
                // create user
                let newdata = new Company();
                newdata.name = response.login;
                newdata.password = response.id;

                newdata.githublogin = response.login;
                newdata.githubid = response.id;
                newdata.isgithubaccount = true;
                await newdata.save();
                return Response.ok(res, "User Registered");
              } else {
                return Response.notOk(res, "User already found");
              }
            }
          );
        }
      })
      .catch((error) => {
        logger.error(error);
        return Response.notOk(res, "Login Errorx");
      });
  },

  linkedinlogin: async function (req, res) {
    const { client_id, redirect_uri, client_secret, code, regtype, state } =
      req.body;

    //logger.info("githublogin server......",req.body)
    const data = new FormData();

    logger.info(regtype);
    data.append("grant_type", "authorization_code");
    data.append("client_id", client_id);
    data.append("client_secret", client_secret);
    data.append("code", code);
    data.append("state", state);
    data.append("redirect_uri", redirect_uri);

    const link =
      "https://www.linkedin.com/oauth/v2/accessToken?grant_type=authorization_code&client_id=" +
      client_id +
      "&client_secret=" +
      client_secret +
      "&code=" +
      code +
      "&state=" +
      state +
      "&redirect_uri=" +
      redirect_uri;

    // Request to exchange code for an access token
    fetch(link, {
      method: "POST",
      body: data,
    })
      .then((response) => response.json())
      .then((paramsString) => {
        let token = paramsString.access_token;

        logger.info("token " + paramsString.access_token);

        //'Authorization', `Bearer ${token}`
        // Request to return data of a user that has been authenticated

        return fetch(
          `https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage~digitalmediaAsset:playableStreams))`,
          {
            method: "get",
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );
      })
      .then((response) => response.json())
      .then((response) => {
        logger.info("result ", response);
        const socialnamelink =
          response.localizedFirstName + " " + response.localizedLastName;
        // login user
        if (regtype == "login") {
          // login
          logger.info("login...");
          User.findOne(
            { islinkaccount: true, linkid: response.id },
            async function (error, user) {
              if (!user) {
                Company.findOne(
                  { islinkaccount: true, linkid: response.id },
                  async function (error, user) {
                    if (!user) {
                      return Response.notOk(res, "user not found");
                    } else {
                      return Response.ok(res, {
                        msgcount: 0,
                        userid: user._id,
                        picture: user.fullpicture,
                        accounttype: user.accounttype,
                        token: await Security.generateToken(
                          user._id,
                          user.name,
                          user.status
                        ),
                        expires: await UserHelper.getSessionTimeout(),
                      });
                    }
                  }
                );
              } else {
                return Response.ok(res, {
                  msgcount: 0,
                  userid: user._id,
                  picture: user.fullpicture,
                  accounttype: user.accounttype,
                  token: await Security.generateToken(
                    user._id,
                    user.name,
                    user.status
                  ),
                  expires: await UserHelper.getSessionTimeout(),
                });
              }
            }
          );
        } else if (regtype == "dev") {
          // check if already found
          User.findOne(
            { islinkaccount: true, linkid: response.id },
            async function (error, user) {
              if (!user) {
                // create user
                let newdata = new User();
                newdata.name = socialnamelink;
                newdata.password = response.id;

                newdata.linkid = response.id;
                newdata.islinkaccount = true;
                await newdata.save();
                return Response.ok(res, "User Registered");
              } else {
                return Response.notOk(res, "User already found");
              }
            }
          );
        } else {
          // check if already found
          Company.findOne(
            { islinkaccount: true, linkid: response.id },
            async function (error, user) {
              if (!user) {
                // create user
                let newdata = new Company();
                newdata.name = socialnamelink;
                newdata.password = response.id;

                newdata.linkid = response.id;
                newdata.islinkaccount = true;
                await newdata.save();
                return Response.ok(res, "User Registered");
              } else {
                return Response.notOk(res, "User already found");
              }
            }
          );
        }
      })
      .catch((error) => {
        logger.info("error login", error);
        return Response.notOk(res, "Login Error");
      });
  },

  updateapplicantstatus: async function (req, res) {
    let userid = req.userid;

    let id = req.body.id;
    let status = req.body.status;

    let data = await JobApplicant.findById(id).exec();
    data.status = status;
    await data.save();

    return Response.ok(res);
  },
  jobsearch: async function (req, res) {
    let userid = req.userid;

    let skills = req.body.skills;
    let type = req.body.selectedtalent;
    let isjob = req.body.isjob;
    let isguest = req.body.isguest;

    let fulltime = req.body.fulltime;
    let parttime = req.body.parttime;
    let projectbasis = req.body.projectbasis;

    let remoteonly = req.body.isremote;
    let minsalary = req.body.minsalary;
    let maxsalary = req.body.maxsalary;

    let startdate = req.body.startdate;
    let enddate = req.body.enddate;

    let matchesAllSkills = req.body.matchesAllSkills;

    let excludeNoSalary = req.body.excludeNoSalary;
    let country = req.body.country;

    let orcondition = [];
    if (fulltime) {
      orcondition.push({ jobtype: "Full time" });
    }
    if (parttime) {
      orcondition.push({ jobtype: "Part Time" });
    }
    if (projectbasis) {
      orcondition.push({ jobtype: "Project Basis" });
    }

    let andcondition = [];
    andcondition.push({ status: 1 });
    if (isjob && isguest) {
      andcondition.push({ whoview: { $regex: "Everyone", $options: "i" } });
    }
    let salarycondition = [];
    logger.info("maxsalary", maxsalary, orcondition);

    if (isjob && excludeNoSalary) {
      andcondition.push({
        $and: [{ minsalary: { $gte: 0 } }, { maxsalary: { $gte: 0 } }],
      });
    } else {
      salarycondition.push({
        $and: [{ maxsalary: { $lte: 0 } }, { minsalary: { $lte: 0 } }],
      });
    }

    if (country) {
      andcondition.push({ location: { $regex: country, $options: "i" } });
    }
    if (isjob && maxsalary > 0) {
      //
      salarycondition.push({
        $and: [
          { maxsalary: { $gte: maxsalary } },
          { minsalary: { $lte: minsalary } },
        ],
      });
      salarycondition.push({
        $and: [
          { maxsalary: { $lte: maxsalary } },
          { maxsalary: { $gte: minsalary } },
        ],
      });
      salarycondition.push({
        $and: [
          { minsalary: { $gte: minsalary } },
          { minsalary: { $lte: maxsalary } },
        ],
      });
      andcondition.push({ $or: salarycondition });
    }
    if (!startdate && isjob) {
      const today = new Date(new Date().setDate(new Date().getDate() - 1));
      andcondition.push({ toduration: { $gt: today } });
    }
    if (isjob && startdate) {
      //TODO Handle min = max
      andcondition.push({
        $and: [
          {
            fromduration: {
              $lte: new Date(
                new Date().setDate(new Date(enddate).getDate() + 1)
              ),
              //new Date(enddate) + 1000 * 3600 * 24,
            },
          },
          {
            fromduration: {
              $gte: new Date(startdate),
            },
          },
          {
            toduration: {
              $gte: new Date(startdate),
            },
          },
        ],
      });
    }

    let jobsid = [];
    let containskills = false;
    if (skills.length > 0) {
      containskills = true;
    }
    for (let i = 0; i < skills.length; i++) {
      if (skills[i].value === skills[i].label) {
        const key = skills[i].value;
        const data = await Skill.find({ name: { $regex: key, $options: "i" } })
          .sort({ $natural: -1 })
          .lean()
          .exec();
        if (data && data.length) {
          jobsid = data.map((details) => {
            Skill.updateCount(details._id);
            return details._id;
          });
        }
      } else {
        Skill.updateCount(skills[i].value);
        jobsid.push(skills[i].value);
      }
    }

    if (orcondition.length === 0) {
      orcondition.push({});
    }
    let data = [];
    let skillcondition = [];

    if (!isjob && type && type.length > 0) {
      logger.info("cond type ");
      andcondition.push({ type: { $in: type } });
    }
    if (containskills) {
      if (matchesAllSkills) {
        skillcondition = { $all: jobsid };
      } else {
        skillcondition = { $in: jobsid };
      }

      logger.info("orcondition", orcondition);

      if (isjob) {
        data = await Job.find({
          skills: skillcondition,
          $or: orcondition,
          $and: andcondition,
        })
          .populate("user company")
          .sort({ $natural: -1 })
          .lean()
          .exec();
      } else {
        // talent
        data = await User.find({
          skills: skillcondition,
          $or: orcondition,
          $and: andcondition,
        })
          .populate("type")
          .sort({ $natural: -1 })
          .lean({ virtuals: true })
          .exec();
      }
    } else {
      // logger.info("xx99x",orcondition,isjob)
      logger.info("condition", andcondition);
      // orcondition = [ { jobtype: { '$regex': "Full time", '$options': 'i' } } ];

      if (isjob) {
        data = await Job.find({
          $or: orcondition,
          $and: andcondition,
        })
          .populate("company")
          .sort({ $natural: -1 })
          .lean()
          .exec();
        //logger.info("data",data)
      } else {
        // talent
        data = await User.find({
          $or: orcondition,
          $and: andcondition,
        })
          .populate("type")
          .sort({ $natural: -1 })
          .lean({ virtuals: true })
          .exec();
      }
    }

    // remote only
    if (remoteonly) {
      data = data.filter((item) => item.acceptremote === true);
    }

    // add skills
    for (let i = 0; i < data.length; i++) {
      if (data[i].skills.length > 0) {
        data[i].skills = await Skill.find({ _id: data[i].skills })
          .sort({ $natural: -1 })
          .lean()
          .exec();
      }
    }
    return Response.ok(res, data);
  },

  updateprofilecover: async function (req, res) {
    let userid = req.userid;
    const data = await ImageManager.uploadimagebody(req, res, "cover");
    let info = await Company.findById(userid).sort({ $natural: -1 }).exec();
    info.cover = data.cover;
    logger.info(data);
    await info.save();
    return Response.ok(res);
  },
  updatepush: function (req, res) {
    let userid = req.userid;

    let enable = req.body.enable;
    let silent = req.body.silent;

    User.findById(userid, function (error, user) {
      if (error) return res.serverError(error);
      if (!user) return res.notFound("User not found");

      if (enable) {
        user.push.enable = enable;
      }

      if (silent) {
        user.push.silent = silent;
      }

      user.save(async function (error) {
        if (error) return res.serverError(error);
        return res.ok({
          token: await Security.generateToken(
            user._id,
            user.full_name,
            user.status
          ),
          expires: await UserHelper.getSessionTimeout(),
        });
      });
    });
  },

  changepass: function (req, res) {
    let userid = req.userid;
    let oldpass = req.body.oldpass;
    let newpass = req.body.newpass;

    User.findById(userid, function (error, user) {
      if (error) return res.serverError(error);
      if (!user) return res.notFound("User not found");

      user.comparePassword(oldpass, function (valid) {
        if (!valid) return res.badRequest("wrong password");

        user.password = newpass;

        user.save(function (error) {
          if (error) return res.serverError(error);
          return res.ok({
            token: jwt.sign(user.toJSON(), _config("jwt.secret"), {
              expiresIn: _config("jwt.expires"),
            }),
            expires: _config("jwt.expires"),
          });
        });
      });
    });
  },
  /**
   * Verify a new user
   * @param req
   * @param res
   * @returns {*}
   */
  verifyuser: async function (req, res) {
    let token = req.headers["token"];
    let user = jwt.decode(token);
    let body = req.body;
    //  let verifycode = body.verify;
    // logger.info("verify...." + body.verify,user)
    if (!user) {
      return res.notFound("user not found");
    }
    let id = user._id;
    if (!id) {
      return res.notFound("user not found");
    }
    User.findById(id, async function (error, user) {
      if (error) return res.serverError(error);
      if (!user) return res.notFound("user not found");
      user.status = 1;
      user.verifiedphone = true;
      await user.save();

      user.password = undefined;

      logger.info("" + user._id, "verified ", req.path);

      const settinginfo = await Settings.findOne().lean().exec();

      let interval = 5;
      if (settinginfo) {
        interval = settinginfo.locationinterval;
      }
      return res.ok({
        user: user,
        interval: interval,
        token: await Security.generateToken(
          user._id,
          user.full_name,
          user.status
        ),
        expires: await UserHelper.getSessionTimeout(),
      });
    });
  },

  verifyemail: async function (req, res) {
    const token = req.params.token;

    try {
      let userid = Security.base64decode(token);
      let userdata = await User.findById(userid, "_id verifyemail").exec();

      if (userdata) {
        userdata.verifiedemail = true;
        await userdata.save();
        return res.render("verifyemailok");
      } else {
        return res.render("verifyemailnook");
      }
    } catch (e) {
      return res.render("verifyemailnook");
    }

    return res.render("verifyemailok");
  },

  resetpassword: function (req, res) {
    const hashtoken = req.params.token;

    const url = _config("app.url");

    let csrfToken = req.csrfToken();
    res.cookie("XSRF-TOKEN", csrfToken);
    res.locals.csrfToken = csrfToken;

    logger.info(csrfToken);

    return res.render("resetpassword", {
      url: url,
      token: hashtoken,
      csrfToken: csrfToken,
    });
  },

  userlogout: async function (req, res) {
    req.logout();
    let userid = req.userid;

    logger.info(userid);
    let userdata = await User.findById(userid).exec();

    if (userdata) {
      userdata.isloggedin = false;
      userdata.isonline = false;
      userdata.save();
    }

    return res.ok();
  },
  /**
   * Query for companies
   * @param {Object} filter - Mongo filter
   * @param {Object} options - Query options
   * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
   * @param {number} [options.limit] - Maximum number of results per page (default = 10)
   * @param {number} [options.page] - Current page (default = 1)
   * @returns {Promise<QueryResult>}
   */
  queryCompanies: async function (req, res) {
    var filter = req.body.filter === undefined ? {} : req.body.filter;
    var options = req.body.options === undefined ? {} : req.body.options;
    const Companies = await Company.paginate(filter, options);
    return res.ok(Companies);
  },
  /**
   * Query for jobs
   * @param {Object} filter - Mongo filter
   * @param {Object} options - Query options
   * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
   * @param {number} [options.limit] - Maximum number of results per page (default = 10)
   * @param {number} [options.page] - Current page (default = 1)
   * @returns {Promise<QueryResult>}
   */
  queryJobs: async function (req, res) {
    var filter = req.body.filter === undefined ? {} : req.body.filter;
    var options = req.body.options === undefined ? {} : req.body.options;
    const Jobs = await Job.paginate(filter, options);
    return res.ok(Jobs);
  },
};
