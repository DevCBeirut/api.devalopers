
module.exports = {

    log: async function (userid, msg = "", link = "") {
        return;
        let log = new Logs();
        log.msg = msg;
        if (userid.length) {
            log.user = userid;
        }
        log.link = link;
        log.save();
    },

};