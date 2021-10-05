const nodemailer = require("nodemailer");
let logger = require("../helpers/Logger");

module.exports = {
  /**
   * Send emails
   * @param req
   * @param res
   */
  sendemail: async function (email, subject, msg) {
    logger.info("send email..to :" + email, msg);
    //return;

    const smtpTransport = nodemailer.createTransport({
      name: process.env.emailname,
      host: process.env.emailhost,
      port: process.env.emailport,
      secure: true,
      //socketTimeout: process.env.emailtimeout,
      logger: true,
      auth: {
        user: process.env.emailfrom,
        pass: process.env.emailpassword,
      },
    });

    const mailOptions = {
      from: process.env.emailfrom, // sender address
      to: email, // list of receivers
      subject: subject, // Subject line
      html: msg, // plain text body
    };

    smtpTransport.sendMail(mailOptions, function (err, info) {
      if (err) {
        logger.info(err);
      } else {
        logger.info(info);
        logger.info("sent!");
      }
    });
  },

  senddummy: async function () {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let account = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: account.user, // generated ethereal user
        pass: account.pass, // generated ethereal password
      },
    });

    // setup email data with unicode symbols
    let mailOptions = {
      from: '"Fred Foo 👻" <foo@example.com>', // sender address
      to: "bar@example.com, baz@example.com", // list of receivers
      subject: "Hello ✔", // Subject line
      text: "Hello world?", // plain text body
      html: "<b>Hello world?</b>", // html body
    };

    // send mail with defined transport object
    let info = await transporter.sendMail(mailOptions);

    logger.info("Message sent: %s", info.messageId);
    // Preview only available when sending through an Ethereal account
    logger.info("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  },
};
