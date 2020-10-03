/**
 * UsersController
 * @description :: Server-side logic for managing users
 */

let jwt = require("jsonwebtoken");
let _ = require('lodash');
let Security = require("../helpers/Security");
let Logger = require("../helpers/Logger");
let Utils = require("../helpers/Utils");
let UserHelper = require("../helpers/UserHelper");
let ImageManager = require("../helpers/ImageManager");
let Response = require("../helpers/Response");
module.exports = {

    /**
     * Create a new user
     * @param req
     * @param res
     * @returns {*}
     */
    createuser: async function (req, res) {
        let user = new User(req.body);

        let count = await User.countDocuments({ 'email': req.body.email }).exec();
        if (count > 0) {
            return Response.notOk(res, "Email already found");
        }
        count = await Company.countDocuments({ 'email': req.body.email }).exec();
        if (count > 0) {
            return Response.notOk(res, "Email already found");
        }

        user.save(async function (error, user) {
            console.log("error", error)
            if (error) return Response.notOk(res, "Incorrect Data");

            return Response.ok(res,{
                msg: "Please Verify your account",
                userid:user._id,
                token: await Security.generateToken(user._id, user.full_name, user.status),
                expires: await UserHelper.getSessionTimeout()
            });
        });
    },



    userinfo: async function (req, res) {
        let devid = req.params.id;
        let userid = req.userid;
        let info = await User.findById(devid).populate("type").sort({ "$natural": -1 }).lean({ virtuals: true }).exec();
        if (info && info.skills && info.skills.length > 0) {
            info.skills = await Skill.find({ _id: info.skills }).sort({ "$natural": -1 }).lean().exec();
        }
        const msgcount = 1;
        let previousjob = []
        let profileprogress = {}
        let canedit = false
        if(info){
             profileprogress = await UserHelper.calculateProfileProgress(info)
            if (!userid) {
                previousjob= []
            }

            if (userid == info._id) {
                canedit = true
            } else {
                await User.updateView(devid);
            }
        }else{
            return Response.notOk(res,"Page not found");
        }



        // sort education
        // info
        if(info && info.education){
            let presenteducation = info.education.filter(i=>i.endschoolyear=="present");
            let nopresenteducation = info.education.filter(i=>i.endschoolyear!=="present");
            info.education =  _.orderBy(nopresenteducation, 'endschoolyear', 'desc');
           // console.log("presenteducation",presenteducation)
            info.education = presenteducation.concat(info.education)
        }

        if(info && info.exp){
            let presentexp = info.exp.filter(i=>i.endcompanyear=="present");
            let nopresentexp = info.exp.filter(i=>i.endcompanyear!=="present");
            info.exp =  _.orderBy(nopresentexp, 'endcompanyear', 'desc');
            info.exp = presentexp.concat(info.exp)
        }


        return Response.ok(res, {
            info: info,
            activejobs: [],
            previousjob: previousjob,
            profileprogress: profileprogress,
            canedit: canedit,
            msgcount: msgcount
        });

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
                    token: await Security.generateToken(user._id, user.full_name, user.status),
                    expires: await UserHelper.getSessionTimeout()
                });
            });

        });
    },


    updateprofile: async function (req, res) {
        let userid = req.userid;
        const data = await ImageManager.uploadimagebody(req, res)
        const first = data.first;
        const last = data.last;
        const location = data.location;
        const website = data.website;
        const description = data.description;
        const type = data.type
        const picture = data.picture;
        const rate = data.rate;

        const linkfb = data.linkfb;
        const linklinking = data.linklinking;
        const linkgithub = data.linkgithub;
        const removepic = data.removepic;


        let companyinfo = await User.findById(userid).sort({ "$natural": -1 }).exec();

        companyinfo.location = location;
        if (Utils.validURL(website)) {
            companyinfo.website = website;
        }

        companyinfo.description = description;
        if (type) {
            companyinfo.type = type;
        }

        if(parseInt(rate)>=0){
            companyinfo.rate = rate;
        }


            companyinfo.website = website;
            companyinfo.linkfb = linkfb;
            companyinfo.linklinking = linklinking;
            companyinfo.linkgithub = linkgithub;


        if (picture && picture.length > 1) {
            companyinfo.picture = picture;
        }
        if(!picture && removepic){
           companyinfo.picture = "";
        }


        companyinfo.first = first;
        companyinfo.last = last;


        await companyinfo.save()
        if(!picture && removepic){
            return Response.ok(res, {
                picture: ""
            });
        }
        return Response.ok(res, {
            picture: companyinfo.fullpicture
        });
    },

    updateprofilecover: async function (req, res) {
        let userid = req.userid;
        const data = await ImageManager.uploadimagebody(req, res, "cover")
        let info = await User.findById(userid).sort({ "$natural": -1 }).exec();
        info.cover = data.cover;
        await info.save()
        return res.ok();
    },
    updateabout: async function (req, res) {
        let userid = req.userid;
        let info = await User.findById(userid).exec();
        info.about = req.body.about;
        await info.save()
        return res.ok();
    },
    updateskills: async function (req, res) {
        let userid = req.userid;
        let info = await User.findById(userid).exec();
        const skills = req.body.skills;
        console.log("skills", skills)

        info.skills = skills;
        await info.save()
        return Response.ok(res);
    },
    updatecv: async function (req, res) {
        let userid = req.userid;
        try {
            const data = await ImageManager.uploadimagebody(req, res, "cv")
            let info = await User.findById(userid).sort({ "$natural": -1 }).exec();
            info.cv = data.cv;
            info.cvrealfilename = data.cvrealfilename;

            await info.save()
            console.log("xxx")
            return Response.ok(res);
        } catch (e) {
            console.log("error")
            return Response.notOk(res, "Error Please Try again");
        }

    },
    updatelang: async function (req, res) {
        let userid = req.userid;
        let info = await User.findById(userid).exec();
        const languagename = req.body.languagename;
        const languageproficienty = req.body.languageproficienty;
        let language = info.language
        language.push({ languagename: languagename, languageproficienty: languageproficienty })
        info.language = language;
        await info.save()
        return Response.ok(res);
    },
    deletelang: async function (req, res) {
        let userid = req.userid;
        let info = await User.findById(userid).exec();
        const languagename = req.body.languagename;
        info.language = info.language.filter(e => e.languagename != languagename);
        await info.save()
        return Response.ok(res);
    },
    deleteeducation: async function (req, res) {
        let userid = req.userid;
        let info = await User.findById(userid).exec();
        const school = req.body.school;
        info.education = info.education.filter(e => e.school != school);
        await info.save()
        return Response.ok(res);
    },
    deletework: async function (req, res) {
        let userid = req.userid;
        let info = await User.findById(userid).exec();
        const companyname = req.body.companyname;
        info.exp = info.exp.filter(e => e.companyname != companyname);
        await info.save()
        return Response.ok(res);
    },
    updateworkexp: async function (req, res) {
        let userid = req.userid;
        let info = await User.findById(userid).exec();

        const companyname = req.body.companyname;
        const companyposition = req.body.companyposition;
        const startcompanyyear = req.body.startcompanyyear;
        const endcompanyear = req.body.endcompanyear;
        const companydescription = req.body.companydescription;

        let exp = info.exp
        exp.unshift({
            companyname: companyname,
            companyposition: companyposition,
            startcompanyyear: startcompanyyear,
            endcompanyear: endcompanyear,
            companydescription: companydescription
        })
        info.exp = exp;
        await info.save()
        return res.ok()
    },
    updateeducation: async function (req, res) {
        let userid = req.userid;
        let info = await User.findById(userid).exec();

        const school = req.body.school;
        const degree = req.body.degree;
        const startschoolyear = req.body.startschoolyear;
        const endschoolyear = req.body.endschoolyear;

        let education = info.education
        education.unshift({
            school: school,
            degree: degree,
            startschoolyear: startschoolyear,
            endschoolyear: endschoolyear
        })

        info.education = education;
        await info.save()
        return res.ok()
    },


    userdashboard: async function (req, res) {
        let userid = req.userid;
        const info = await User.findById(userid).sort({ "$natural": -1 }).lean({ virtuals: true }).exec();
        const countsavedjobs = await JobSaved.countDocuments({ user: userid }).lean().exec();
        const countapplicant = await JobApplicant.countDocuments({ user: userid }).lean({ virtuals: true }).exec();

        const mostactivecompanies = await UserHelper.mostactivecompanies()
        let countdev = await User.countDocuments({ 'status': 1 }).exec();
        let countcompany = await Company.countDocuments({ 'status': 1 }).exec();
        let countjob = await Job.countDocuments({ 'status': 1 }).exec();
        const statistics = { jobs: countjob, companies: countcompany, dev: countdev }
        let profileprogress = await UserHelper.calculateProfileProgress(info)

        const recommendedjob = await UserHelper.recommendedjob(info.skills)

        return Response.ok(res, {
            info: info,
            countsavedjobs: countsavedjobs,
            countapplicant: countapplicant,
            countprofileview: info.views,
            mostactivecompanies: mostactivecompanies,
            statistics: statistics,
            profileprogress: profileprogress,
            recommendedjob: recommendedjob
        });
    },

    mysavedjob: async function (req, res) {
        let companyid = req.userid;
        const data = await JobSaved.find({ "user": companyid }).populate("job").sort({ "$natural": -1 }).lean().exec();
        return Response.ok(res, data);
    },
    myapplication: async function (req, res) {
        let companyid = req.userid;
        const data = await JobApplicant.find({ "user": companyid }).populate("job").sort({ "$natural": -1 }).lean().exec();
        return Response.ok(res, data);
    },
    savejobapplicant: async function (req, res) {

        let userid = req.userid;
        let jobid = req.params.id;
        let saved = true
        const jobinfo = await JobSaved.findOne({ user: userid, job: jobid }).exec();
        if (jobinfo && jobinfo.user) {
            await jobinfo.remove();
            saved = false;
        } else {
            let newdata = new JobSaved();
            newdata.user = userid;
            newdata.job = jobid;
            await newdata.save()
        }
        return Response.ok(res, {
            saved: saved
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

                if (!valid) return res.badRequest('wrong password');

                user.password = newpass;

                user.save(function (error) {
                    if (error) return res.serverError(error);
                    return res.ok({
                        token: jwt.sign(
                            user.toJSON(),
                            _config("jwt.secret"),
                            { expiresIn: _config("jwt.expires") }
                        ),
                        expires: _config("jwt.expires")
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
        let token = req.headers['token'];
        let user = jwt.decode(token);
        let body = req.body;
        //  let verifycode = body.verify;
        // console.log("verify...." + body.verify,user)
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

            Logger.log("" + user._id, "verified ", req.path);

            const settinginfo = await Settings.findOne().lean().exec();

            let interval = 5;
            if (settinginfo) {
                interval = settinginfo.locationinterval
            }
            return res.ok({
                user: user,
                interval: interval,
                token: await Security.generateToken(user._id, user.full_name, user.status),
                expires: await UserHelper.getSessionTimeout()
            });
        });
    },




    /**
     * login  user
     * @param req
     * @param res
     * @returns {*}
     */
    userlogin: async function (req, res) {

        let body = req.body;
        let email = body.email;
        let password = body.password;
        let isdev = true;
        // console.log("login...email : " + email + " pass : " + password);
        if (!email || !password) return Response.notOk(res, 'email and password required');

        let accountinfo = await User.findOne({ email: email }).exec()

        if (!accountinfo) {
            accountinfo = await Company.findOne({ email: email }).exec()
            isdev = false
        }

        if (!accountinfo) return Response.notOk(res, 'Wrong login info');

        const passwordstatus = await accountinfo.comparePassword(password);
        if (!passwordstatus) {
            return Response.notOk(res, 'Invalid password');
        }

        if (accountinfo.status === 0) {
            return Response.ok(res, {
                msg: "Please Check your phone for verification code",
                token: await Security.generateToken(accountinfo._id, accountinfo.name, accountinfo.status),
                expires: await UserHelper.getSessionTimeout()
            });
        }

        accountinfo.lastlogin = Date.now();
        await accountinfo.save();
        accountinfo.password = undefined

        let roomcondition = { user: accountinfo._id }




        const roominfo = await Room.find(roomcondition).exec()


        let msgcount = 0;
        for (let i = 0; i < roominfo.length; i++) {

            let condition = { user: roominfo[i].user, room: roominfo[i]._id, status: 0 }
            if (isdev) {
                condition = { company: roominfo[i].company, room: roominfo[i]._id, status: 0 }
            }
            const msgcounter = await Message.countDocuments(condition).exec()
            //console.log("msgcount",msgcount,condition)
            msgcount = msgcount + msgcounter;
        }


        return Response.ok(res, {
            msgcount: msgcount,
            userid: accountinfo._id,
            picture: accountinfo.fullpicture,
            accounttype: accountinfo.accounttype,
            token: await Security.generateToken(accountinfo._id, accountinfo.name, accountinfo.status),
            expires: await UserHelper.getSessionTimeout()
        });
    },



    forgotpassword: async function (req, res) {

        let encodedimage = req.body;
        let email = encodedimage.email;

        let data = await User.findOne({ 'email': email }, '_id password').lean().exec();

        if (data) {
            UserHelper.sendResetPasswordEmail(data._id, email);
            return Response.ok(res);
        }
        data = await Company.findOne({ 'email': email }, '_id password').lean().exec();

        if (data) {
            UserHelper.sendResetPasswordEmail(data._id, email);
            return Response.ok(res);
        }
        return Response.notOk(res, "user not found");

    },



    verifyemail: async function (req, res) {
        const token = req.params.token;

        try {

            let userid = Security.base64decode(token)
            let userdata = await User.findById(userid, '_id verifyemail').exec();

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
        res.cookie('XSRF-TOKEN', csrfToken);
        res.locals.csrfToken = csrfToken;

        console.log(csrfToken)

        return res.render("resetpassword", { url: url, token: hashtoken, csrfToken: csrfToken });
    },

    resetnewpassword: async function (req, res) {

        let data = req.body;
        let token = data.token;
        let newpass = data.newpass;

        try {

            let userid = Security.base64decode(token)
            let userdata = await User.findById(userid, '_id password').exec();
            if (!userdata) {
                userdata = await Company.findById(userid, '_id password').exec();
            }



            if (userdata) {
                userdata.password = newpass;
                await userdata.save();
                console.log("passwordchanged", data)
                return res.ok();
            } else {
                return res.notFound("User not found");
            }
        } catch (e) {
            return res.notFound("User not found");
        }


        return res.notFound("User not found");
    },


    userlogout: async function (req, res) {
        req.logout();
        let userid = req.userid;

        console.log(userid)
        let userdata = await User.findById(userid).exec();

        if (userdata) {
            userdata.isloggedin = false;
            userdata.isonline = false;
            userdata.save();
        }

        return Response.ok(res);
    },


};

