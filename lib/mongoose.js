let mongoose = require('mongoose');
let logger=require('../app/helpers/Logger');
const { db } = require('../app/models/User');

mongoose.connect(process.env.dburl,{useNewUrlParser: true });

mongoose.connection.on('connected', function () {
    logger.info('Mongoose default connection open to ' + process.env.dburl);    
});

mongoose.connection.on('error', function (err) {
    logger.info('Mongoose default connection errors: ' + err);
});

mongoose.connection.on('disconnected', function () {
    logger.info('Mongoose default connection disconnected');
});

process.on('SIGINT', function () {
    mongoose.connection.close(function () {
        logger.info('Mongoose default connection disconnected through app termination');
        process.exit();
    });
});
