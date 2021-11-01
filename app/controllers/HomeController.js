/**
 * UsersController
 * @description :: Server-side logic for managing users
 */

let Response = require("../helpers/Response");
let logger = require("../helpers/Logger");
let UserHelper = require("../helpers/UserHelper");
let csc = require("country-state-city").default;
module.exports = {
  frontend: async function (req, res) {
    const skilllist = await Skill.find()
      .sort({ count: "descending" })
      .limit(16)
      .lean()
      .exec();

    let countdev = await User.countDocuments({ status: 1 }).exec();
    let countcompany = await Company.countDocuments({ status: 1 }).exec();
    let countjob = await Job.countDocuments({ status: 1 }).exec();
    let companylist = await Company.find()
      .sort({ $natural: -1 })
      .limit(6)
      .exec();
    const statistics = {
      jobs: countjob,
      companies: countcompany,
      dev: countdev,
    };

    const testimonials = [
      {
        picture: "",
        description:
          "Love this website, flexible and easy to use, I found a lot of job opportunities in Lebanon and abroad",
        name: "Sami A. ",
        jobtitle: "Senior software engineer",
      },
      {
        picture: "",
        description:
          "This platform helped me find highly-skilled employees to the needed roles in my company, skill match is a great idea, moreover the user experience as a company was great",
        name: "Lara S.",
        jobtitle: "Web development company Owner",
      },
      {
        picture: "",
        description:
          "Great website, loved the usabily. I created my account in 2 minutes, after finalizing my profile, I took a look into the skill matched jobs and applied directly, whole process took around 10 minutes ",
        name: "Jad K. ",
        jobtitle: "Information Technology Undergraduate",
      },
    ];
    return Response.ok(res, {
      skilllist: skilllist,
      statistics: statistics,
      testimonials: testimonials,
      companylist: companylist,
    });
  },

  contactus: async function (req, res) {
    let data = new Contact(req.body);
    await data.save();
    return Response.ok(res);
  },

  allskills: async function (req, res) {
    const data = await Skill.find()
      .sort({ type: 1, name: 1, count: -1 })
      .lean()
      .exec();
    return Response.ok(res, data);
  },
  allCountries: async function (req, res) {
    const data = await csc.getAllCountries();
    return Response.ok(res, data);
  },
  allCities: async function (req, res) {
    const data = await csc.getAllCities();
    return Response.ok(res, data);
  },
  countryCities: async function (req, res) {
    const countryCode =
      req.body.countryCode === undefined ? "LB" : req.body.countryCode;
    const data = await csc.getCitiesOfCountry(countryCode);
    return Response.ok(res, data);
  },
  alljob: async function (req, res) {
    const page = req.params.page;
    let userid = req.userid;
    logger.info("list...." + page);
    const limit = _config("app.pagination_limit");

    let skip = 0;
    if (page > 1) {
      skip = (page - 1) * limit;
    }
    let today = new Date(new Date().setDate(new Date().getDate() - 1));
    let count = await Job.countDocuments({ toduration: { $gt: today } }).exec();
    logger.info("count " + count);
    let items = [];
    if (!userid || userid.length < 3) {
      items = await Job.find({
        whoview: { $regex: "Everyone", $options: "i" },
        toduration: { $gt: today },
      })
        .populate("user company")
        .sort({ $natural: -1 })
        .skip(skip)
        .limit(limit)
        .lean({ virtuals: true })
        .exec();
    } else {
      items = await Job.find({ toduration: { $gt: today } })
        .populate("user company")
        .sort({ $natural: -1 })
        .skip(skip)
        .limit(limit)
        .lean({ virtuals: true })
        .exec();
    }
    for (let i = 0; i < items.length; i++) {
      if (items[i].skills && items[i].skills.length > 0) {
        items[i].skills = await Skill.find({ _id: items[i].skills })
          .sort({ $natural: -1 })
          .lean()
          .exec();
      }
    }

    // always hide expired job

    return Response.ok(res, {
      data: items,
      count: Math.ceil(count / limit),
    });
  },
  jobinfo: async function (req, res) {
    const jobid = req.params.id;
    let data = await Job.findById(jobid)
      .populate("company")
      .sort({ $natural: -1 })
      .populate("user company")
      .lean({ virtuals: true })
      .exec();
    let saved = false;
    let alreadyapplied = false;
    let userid = req.userid;
    let companyid = "";
    if (data.skills.length > 0) {
      data.skills = await Skill.find({ _id: data.skills })
        .sort({ $natural: -1 })
        .lean()
        .exec();
    }

    let expired = false;

    let today = new Date(new Date().setDate(new Date().getDate() - 1));

    let jobisexpired = await Job.findOne({
      _id: jobid,
      toduration: { $gt: today },
    })
      .populate("company")
      .lean({ virtuals: true })
      .exec();

    if (!jobisexpired) {
      expired = true;
    }
    if (userid && data.company) {
      const jobinfo = await JobSaved.countDocuments({
        user: userid,
        job: jobid,
      }).exec();
      if (jobinfo > 0) {
        saved = true;
      }
    }
    if (userid) {
      const jobinfo = await JobApplicant.countDocuments({
        user: userid,
        job: jobid,
      }).exec();
      if (jobinfo > 0) {
        alreadyapplied = true;
      }
    }

    let otherjob = [];
    if (data.company) {
      companyid = data.company._id;
      otherjob = await Job.find({ _id: { $ne: jobid }, company: companyid })
        .populate("user company")
        .sort({ $natural: -1 })
        .lean({ virtuals: true })
        .exec();
    }
    let similar = await UserHelper.recommendedjob(
      data.skills,
      jobid,
      companyid
    );
    let explorejobs = [];
    if (!similar) {
      explorejobs = await UserHelper.explorejobs(data.skills, jobid, companyid);
    }
    return Response.ok(res, {
      info: data,
      saved: saved,
      alreadyapplied: alreadyapplied,
      otherjob: otherjob,
      similar: similar,
      explorejobs: explorejobs,
      expired: expired,
    });
  },
  alldev: async function (req, res) {
    const page = req.params.page;
    logger.info("list...." + page);
    const limit = _config("app.pagination_limit");

    let skip = 0;
    if (page > 1) {
      skip = (page - 1) * limit;
    }
    let count = await User.countDocuments().exec();
    logger.info("count " + count);

    const items = await User.find()
      .populate("type")
      .sort({ $natural: -1 })
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true })
      .exec();
    for (let i = 0; i < items.length; i++) {
      if (items[i].skills && items[i].skills.length > 0) {
        items[i].skills = await Skill.find({ _id: items[i].skills })
          .sort({ $natural: -1 })
          .lean()
          .exec();
      }
    }

    return Response.ok(res, {
      data: items,
      count: Math.ceil(count / limit),
    });
  },

  talenttypelist: async function (req, res) {
    const items = await TalentType.find().sort({ name: 1 }).lean().exec();

    //logger.info("items",items)
    return Response.ok(res, items);
  },

  mycompanyjob: async function (req, res) {
    let companyid = req.userid;
    let today = new Date(new Date().setDate(new Date().getDate() - 1));

    const data = await Job.find({
      company: companyid,
      toduration: { $gt: today },
    })
      .populate("company")
      .sort({ $natural: -1 })
      .lean()
      .exec();

    let previous = await Job.find({
      company: companyid,
      toduration: { $lt: today },
    })
      .populate("company")
      .lean()
      .exec();

    return Response.ok(res, {
      active: data,
      previous: previous,
    });
  },
};
