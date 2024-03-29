let _ = require("lodash");

let Security = require("../helpers/Security");
let logger = require("./Logger");

module.exports = {
  getSessionTimeout: async function () {
    //return "10h"
    const data = await Settings.findOne().lean().exec();
    let timeout = _config("jwt.expires");
    if (data) {
      timeout = data.session * 60; // return number in seconds
    }
    return parseInt(timeout);
  },

  calculateProfileProgress: async function (info, isdev = true) {
    try {
      let profileInput = [
        { input: "linkfb", message: "Add your social media links" },
        { input: "linklinking", message: "Add your social media links" },
        { input: "linkgithub", message: "Add your social media links" },
        { input: "name", message: "Add your name" },
        { input: "picture", message: "Add your profile picture" },
        { input: "cover", message: "Add your cover picture" },
        { input: "website", message: "Add your website" },
        { input: "type", message: "Add your work type" },
        { input: "skills", message: "Add your skills", isarray: true },
        { input: "education", message: "Add your Education" },
        { input: "exp", message: "Add your Work experience" },
        { input: "location", message: "Add your location" },
        { input: "cv", message: "Add your CV" },
        { input: "description", message: "Add your description" },
        { input: "rate", message: "Add your rate" },
        { input: "about", message: "Add your about info" },
      ];

      if (!isdev) {
        profileInput = [
          { input: "linkfb", message: "Add your social media links" },
          { input: "linklinking", message: "Add your social media links" },
          { input: "linkgithub", message: "Add your social media links" },
          { input: "name", message: "Add your name" },
          { input: "picture", message: "Add your profile picture" },
          { input: "cover", message: "Add your cover picture" },
          { input: "website", message: "Add your website" },
          { input: "type", message: "Add your work type" },
          { input: "location", message: "Add your location" },
          { input: "description", message: "Add your description" },
        ];
      }

      const totalscore = profileInput.length;

      let message = "";
      let score = 0;
      let completemsg = "";
      let completed = false;
      profileInput.map((item) => {
        if (
          info[item.input] &&
          (info[item.input]._id || info[item.input].length > 0)
        ) {
          score = score + 1;
        } else {
          message = item.message;
        }
      });

      if (score != totalscore) {
        completemsg = "of your profile complete";
      } else {
        completemsg = "All stars";
        completed = true;
      }

      let profileprogress = {
        message: message,
        completemsg: completemsg,
        score: score + "/" + totalscore,
        completed: completed,
        percent: ((score * 100) / totalscore).toFixed(0),
      };

      return profileprogress;
    } catch (error) {
      logger.error(error);
      return;
    }
  },

  recommendedjob: async function (skills, skipjobid = "", skipcompanyid = "") {
    try {
      let relevantjob = [];
      // add yali manon expiry
      let today = new Date(new Date().setDate(new Date().getDate() - 1));
      let condition = { toduration: { $gt: today } };
      if (skipjobid.length > 1) {
        condition = {
          _id: { $ne: skipjobid },
          company: { $ne: skipcompanyid },
          toduration: { $gt: today },
        };
      }
      let recommendedjob = await Job.find(condition)
        .sort({ $natural: -1 })
        .populate("company")
        .lean()
        .limit(90)
        .exec();
      logger.info("recommendedjob", recommendedjob.length);
      recommendedjob.map((item) => {
        let score = 0;
        item.skills.map((companyskill) => {
          skills.map((devskill) => {
            if (devskill && devskill._id) {
              // logger.info(companyskill,devskill._id)
              if (
                companyskill &&
                companyskill.toString() == devskill._id.toString()
              ) {
                score = score + 1;
                logger.info("addding" + devskill.name);
              }
            } else {
              if (companyskill && companyskill == devskill) {
                score = score + 1;
              }
            }
          });
        });
        relevantjob.push({ job: item._id.toString(), score: score });
      });

      relevantjob = relevantjob.sort((a, b) => (a.score < b.score ? 1 : -1));
      relevantjob = relevantjob.filter((item, index) => index < 3);
      let mostactiveid = [];
      logger.info("relevantjob", relevantjob);
      relevantjob.map((item) => {
        if (item.score > 0) {
          mostactiveid.push(item.job);
        }
      });
      //  logger.info("relevantjob",relevantjob.length)
      // logger.info("mostactiveid",mostactiveid.length)
      recommendedjob = [];
      if (mostactiveid.length > 0) {
        recommendedjob = await Job.find({ _id: mostactiveid })
          .populate("company")
          .sort({ $natural: -1 })
          .lean({ virtuals: true })
          .exec();
      }

      return recommendedjob;
    } catch (error) {
      logger.error(error);
      return;
    }
  },

  explorejobs: async function (skills, skipjobid = "", skipcompanyid = "") {
    let today = new Date(new Date().setDate(new Date().getDate() - 1));
    let condition = { toduration: { $gt: today } };
    if (skipjobid.length > 1) {
      condition = {
        _id: { $ne: skipjobid },
        company: { $ne: skipcompanyid },
        toduration: { $gt: today },
      };
    }
    let explorejobs_arr = await Job.find(condition)
      .sort({ $natural: -1 })
      .populate("company")
      .lean()
      .limit(90)
      .exec();
    return explorejobs_arr;
  },

  mostactivecompanies: async function () {
    let mostactive = [];
    // add yali manon expiry
    let mostactivecompanies = await Job.find()
      .sort({ $natural: -1 })
      .limit(90)
      .lean({ virtuals: true })
      .exec();
    mostactivecompanies.map((item) => {
      let found = mostactive.find((i) => i.company === item.company.toString());
      if (!found) {
        mostactive.push({ company: item.company.toString(), score: 1 });
      } else {
        found.score = found.score + 1;
        mostactive = mostactive.map((item) => {
          if (found.company == item.company) {
            return found;
          }
          return item;
        });
      }
    });

    mostactive = mostactive.sort((a, b) => (a.score > b.score ? 1 : -1));
    mostactive = mostactive.filter((item, index) => index < 5);

    let mostactiveid = [];
    mostactive.map((item) => {
      mostactiveid.push(item.company);
    });

    if (mostactiveid.length > 0) {
      mostactivecompanies = await Company.find({ _id: mostactiveid })
        .lean({ virtuals: true })
        .exec();
    }

    return mostactivecompanies;
  },

  sendResetPasswordEmail: async function (userid, email) {
    logger.info("sendActivationEmail ", userid, email);
    let resettoken = Security.base64encode("" + userid);
    let link = _config("app.url") + "/resetpassword/" + resettoken;
    const msg =
      "Hey, kindly click on the link below to reset your password : <a href='" +
      link +
      "'> Click Here</a>";
    EmailService.sendemail(email, "RESET YOUR PASSWORD", msg);
  },

  sendVerificationEmail: async function (userid, email) {
    logger.info("sendVerificationEmail ", userid, email);
    let resettoken = Security.base64encode("" + userid);
    let link = _config("app.url") + "/verifyemail/" + resettoken;
    const msg =
      "Hey , please click on the link below to verify your email : <a href='" +
      link +
      "'> Click Here</a>";
    EmailService.sendemail(email, "VERIFY YOUR EMAIL", msg);
  },
  sendVerificationAccount: async function (phone, activationcode) {
    SmsService.sendsms(
      "Verify Your account , Your activation code is : " + activationcode,
      phone
    );
  },
  sendPhoneVerification: async function (phone, activationcode) {
    SmsService.sendsms(
      "Verify Your phone , Your activation code is : " + activationcode,
      phone
    );
  },
};
