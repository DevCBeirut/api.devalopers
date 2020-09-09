let fs = require('fs')
let os = require("os");
let helmet = require('helmet');
let compression = require('compression');

global.__basepath = process.cwd();
require('dotenv').config()
global.app = new require("express")();

require("./app");

require("./app/kernel");
app.use(compression());
app.use(helmet());
app.disable('x-powered-by');
global.server = app.listen(_config("app.port"), function () {
    console.log("Server is listening at port " + _config("app.port"));
});

let debugStream = fs.createWriteStream(__dirname + '/error.log', {flags: 'a'})

process.on('unhandledRejection', function (reason, p) {
    console.error(reason.stack);
    debugStream.write("unhandledRejection :  "+reason.stack+os.EOL);
    debugStream.write(p);
    debugStream.write(os.EOL);
    console.log("Node NOT Exiting...");
});

process.on('uncaughtException', function (error) {
    console.error(error.stack);
    debugStream.write("uncaughtException : "+error.stack+os.EOL);
    console.log("Node NOT Exiting...");
});


process.setMaxListeners(0);





