const crypto = require("crypto")


exports.uniqueName = function (filepath) {

    return crypto.createHash('md5').update(filepath).digest('hex').slice(0, 8)



}