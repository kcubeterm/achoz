const crypto = require("crypto")


exports.uniqueName = function (filePath) {

    return crypto.createHash('md5').update(filePath).digest('hex').slice(0, 8)



}