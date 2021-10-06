
module.exports = {

    apiresponse:function (res,success,status=200, data = undefined) {
        let response = {};
        response.message = data;
        response.status = status;
        response.success = success;
        return res.status(status).json(response);
    },
    ok: function (res, data = undefined) {
        return this.apiresponse (res,true,200,data);
    },
    notOk: function (res, message = undefined) {    
        return this.apiresponse (res,false,200,message);
    },
    exist: function (res, message = undefined) {   
        return this.apiresponse (res,false,409,message);
    },
    wronginfo: function (res, message = undefined) {
        return this.apiresponse (res,false,401,message);
    },
    notfound: function (res, message = undefined) {
        return this.apiresponse (res,false,404,message);
    },

};