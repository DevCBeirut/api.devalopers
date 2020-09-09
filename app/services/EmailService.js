const nodemailer = require("nodemailer");

module.exports = {

    /**
     * Send emails
     * @param req
     * @param res
     */
    sendemail: async function (email,subject,msg) {
        console.log("send email..to :"+email,msg)
        //return;

        const smtpTransport = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            socketTimeout: 5000,
            logger: true,
            auth: {
                user: _config("app.gmailfrom"),
                pass: _config("app.gmailpass")
            }
        });

        const mailOptions = {
            from: _config("app.gmailfrom"), // sender address
            to: email, // list of receivers
            subject: subject, // Subject line
            html: msg// plain text body
        };

        smtpTransport.sendMail(mailOptions, function (err, info) {
            if(err){
                console.log(err)
            }else{
                console.log(info);
                console.log("sent!")
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
                pass: account.pass // generated ethereal password
            }
        });

        // setup email data with unicode symbols
        let mailOptions = {
            from: '"Fred Foo 👻" <foo@example.com>', // sender address
            to: "bar@example.com, baz@example.com", // list of receivers
            subject: "Hello ✔", // Subject line
            text: "Hello world?", // plain text body
            html: "<b>Hello world?</b>" // html body
        };

        // send mail with defined transport object
        let info = await transporter.sendMail(mailOptions)

        console.log("Message sent: %s", info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
}