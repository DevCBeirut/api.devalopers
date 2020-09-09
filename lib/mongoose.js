let mongoose = require('mongoose');

mongoose.connect(process.env.dburl);

mongoose.connection.on('connected', function () {
    console.log('Mongoose default connection open to ' + process.env.dburl);
});

mongoose.connection.on('error', function (err) {
    console.log('Mongoose default connection errors: ' + err);
});

mongoose.connection.on('disconnected', function () {
    console.log('Mongoose default connection disconnected');
});

process.on('SIGINT', function () {
    mongoose.connection.close(function () {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit();
    });
});
