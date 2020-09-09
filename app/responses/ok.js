module.exports = function (data) {

    if (this.res.headersSent){
        console.log("header is already sent..")
        return;
    }
    let response = {};

    response.data = data;
    response.status = 200;
    response.success = true;

    this.res.status(response.status);

    if (this.req.isAPI) {
        return this.res.json(response);
    }

    return typeof response.data === "object" ?
        this.res.json(response.data) :
        this.res.end(response.data);
};
