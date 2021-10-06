
module.exports = {

    ok: function (res, data = undefined) {
        let response = {};
        response.data = data;
        response.status = 200;
        response.success = true;
        res.status=200;
        return res.json(response);
    },
    notOk: function (res, message = undefined) {
        let response = {};
        response.message = message;
        response.status = 200;
        response.success = false;
        res.status=200;
        return res.json(response);
    },
    exist: function (res, message = undefined) {
        let response = {};
        response.message = message;
        response.status = 409;
        response.success = false;
        res.status=409;
        return res.json(response);
    },
    wronginfo: function (res, message = undefined) {
        let response = {};
        response.message = message;
        response.status = 401;
        response.success = false;
        res.status=401;
        return res.json(response);
    },
    notfound: function (res, message = undefined) {
        let response = {};
        response.message = message;
        response.status = 404;
        response.success = false;
        res.status=404;
        return res.json(response);
    },

};