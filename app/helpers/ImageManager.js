const multer = require("multer");
let fs = require("fs");
let uuidv4 = require("uuid/v4");
const path = require("path");
const util = require("util");
let logger=require('./Logger');
module.exports = {

    multiuploadfields: async function (req, res, fieldname1 = "picture", fieldname2 = "picture", prefix = "profile") {

        const storage = multer.diskStorage({
            destination: "./public/upload/",
            filename: function (req, file, cb) {
                cb(null, prefix + "-" + Date.now() + path.extname(file.originalname));
            }
        });
        let upload = multer({
            storage: storage,
            limits: { fileSize: 10000000 },
        }).fields([{
            name: fieldname1
        }, {
            name: fieldname2
        }]);

        const uploadx = util.promisify(upload);

        try {

            await uploadx(req, res);

            let body = req.body;
            // logger.info("files",req.files)
            // logger.info(body)
            if (body && req.files && req.files[fieldname1]) {
                body[fieldname1] = req.files[fieldname1];
                logger.info("files1", req.files[fieldname1])
                if (body[fieldname1] && body[fieldname1].filter) {
                    body[fieldname1] = body[fieldname1].filter(item => item !== undefined)
                }

            }
            if (body && req.files && req.files[fieldname2] && req.files[fieldname2]) {
                logger.info("files2", req.files[fieldname2])
                body[fieldname2] = req.files[fieldname2][0].filename;
                // unlink the other

                logger.info("files2xxx ", body[fieldname2], req.files[fieldname2][0].filename)
                try {
                    if (req.files[fieldname2][1]) {
                        const deletedPath = "./public/upload/" + req.files[fieldname2][1].filename;
                        logger.info("delete...", deletedPath)
                        fs.unlinkSync(deletedPath)
                    }
                } catch (err) {
                    logger.error(err)
                }


            }
            if (body) {
                logger.info("success upload ")
                return body
            } else {
                return body
            }
        } catch (e) {

            logger.info("error ", e)
        }


    },

    uploadbase64: async function (req, fieldname = "picture", prefix = "profile") {

        let encodedimage = req.body;
        let encoded = encodedimage[fieldname];
        try {
            let filename = uuidv4() + ".pdf";
            let filepath = _config("app.local_upload_path") + filename;

            encoded = encoded.split(';base64,').pop();
            await fs.writeFile(filepath, encoded, { encoding: 'base64' }, function (error) {
                if (error) return "";
            });
            logger.info("saving...", filename)

            return filename
        }
        catch (error) {
            logger.info("uploadimagebase64 false")
            return "";
        }
    },


    multiuploadimagebody: async function (req, res, fieldname = "picture", prefix = "profile") {

        const storage = multer.diskStorage({
            destination: "./public/upload/",
            filename: function (req, file, cb) {
                cb(null, prefix + "-" + Date.now() + path.extname(file.originalname));
            }
        });

        let upload = multer({
            storage: storage,
            limits: { fileSize: 10000000 },
        }).array(fieldname);

        const uploadx = util.promisify(upload);

        await uploadx(req, res);

        let body = req.body;
        //logger.info("files",req.files)
        if (body && req.files) {
            body[fieldname] = req.files;
        }
        logger.info("multi picture file length " + req.files.length);
        if (body) {
            logger.info("success upload ")
            return body
        } else {
            return body
        }

    },

    uploadimagebody: async function (req, res, fieldname = "picture", prefix = "profile") {

        const storage = multer.diskStorage({
            destination: "./public/upload/",
            filename: req.file.filename,
        });

        let upload = multer({
            storage: storage,
            limits: { fileSize: 10000000 },
        }).single(fieldname);


        const uploadx = util.promisify(upload);

        await uploadx(req, res);

        let body = req.body;
        if (body && req.file) {
            body[fieldname] = req.file.filename;
        }
        if (body) {
            logger.info("success upload ")
            return body
        } else {
            return ""
        }

    },





};
