let fs = require("fs");
let path = require("path");

/**
 * Scan Directories
 * @param dir
 * @returns {Array}
 */

module.exports = function (dir) {

    let files = fs.readdirSync(dir);

    filelist = [];

    files.forEach(function (file) {
        if (fs.statSync(path.join(dir, file)).isFile()) {
            filelist.push(file.replace(".js", ""));
        }
    });

    return filelist;
};
