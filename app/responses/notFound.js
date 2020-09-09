let fs = require('fs')
let os = require("os");
let Utils = require("../helpers/Utils");

module.exports = function (data) {

    if (this.res.headersSent){
        console.log("header is already sent..")
        return;
    }
    let error = new Error();

    error.message = "Page not found";
    error.status = 404;
    error.success = false;

    if (data instanceof Error) {
        error.message = data.message;
    } else if (data) {
        error.message = data
    }
    // log ip and user agent

    this.res.status(error.status);

    if (this.req.isAPI) {
        return this.res.json(error);
    }

    const ip = (this.req.headers['x-forwarded-for'] || this.req.connection.remoteAddress || this.req.socket.remoteAddress || this.req.connection.socket.remoteAddress).split(",")[0];

    const headers = this.req.headers;
    const url = this.req.url;

    let debugStream = fs.createWriteStream(__dirname + '/../../notfound.log', {flags: 'a'})

    if(debugStream){
        debugStream.write("ERROR ----- START :"+Utils.getCurrentDateTimeString());
        debugStream.write(os.EOL);
        debugStream.write("ip : "+ip);
        debugStream.write(os.EOL);
        debugStream.write("url : "+url);
        debugStream.write(os.EOL);
        debugStream.write("headers : "+JSON.stringify(headers));
        debugStream.write(os.EOL);
        debugStream.write("ERROR ----- END ");
        debugStream.write(os.EOL);
        console.log("Error Captured and logged..")
    }



    return this.res.render("errors/404", error);
};
