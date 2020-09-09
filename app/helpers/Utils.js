const moment = require("moment")
let fs = require("fs");;
const path = require("path");
module.exports = {


    deleteFile: function (filename) {
        try {

            const deletedPath = "./public/upload/" + path.basename(filename);
            console.log("delete...", deletedPath)
            fs.unlinkSync(deletedPath)

        } catch (err) {
            console.error(err)
        }
    },

    isdateBigger: function (startDate, endDate) {
        let isAfter = moment(startDate).isAfter(endDate);

        console.log("compare ", isAfter)
        if (isAfter) {
            return false;
        }
        return true;
    },
    getCurrentDateTimeString: function () {
        const date = new Date();
        return date.getFullYear() + '-' +
            (date.getMonth() + 1).toString().padStart(2, '0') + '-' +
            date.getDate().toString().padStart(2, '0') + ':' +
            date.getHours().toString().padStart(2, '0') + ':' +
            date.getMinutes().toString().padStart(2, '0') + ':' +
            date.getSeconds().toString().padStart(2, '0');
    },

    randomnumber: function () {
        return Math.floor((Math.random() * 999999) + 900000);
    },

    hex2utf8: function (pStr) {
        let tempstr = ''
        try {
            tempstr = decodeURIComponent(pStr.replace(/\s+/g, '').replace(/[0-9a-f]{2}/g, '%$&'));
        }
        catch (err) {

            for (b = 0; b < pStr.length; b = b + 2) {
                tempstr = tempstr + String.fromCharCode(parseInt(pStr.substr(b, 2), 16));
            }
        }
        return tempstr;
    },

    validURL: function (str) {
        var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
        return !!pattern.test(str);
    }

};