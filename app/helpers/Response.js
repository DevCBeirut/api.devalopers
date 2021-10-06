
module.exports = {

    ok: function (res, data = undefined) {
        let response = {};
        response.data = data;
        response.status = 200;
        response.success = true;
        return res.status(200).json(response);
    },
    notOk: function (res, message = undefined) {
        let response = {};
        response.message = message;
        response.status = 200;
        response.success = false;
        return res.status(200).json(response);
    },
    exist: function (res, message = undefined) {
        let response = {};
        response.message = message;
        response.status = 409;
        response.success = false;
        return res.status(409).json(response);
    },
    wronginfo: function (res, message = undefined) {
        let response = {};
        response.message = message;
        response.status = 401;
        response.success = false;
        return res.status(401).json(response);
    },
    notfound: function (res, message = undefined) {
        let response = {};
        response.message = message;
        response.status = 404;
        response.success = false;
        return res.status(404).json(response);
    },

};