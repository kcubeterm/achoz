

const fs = require('fs')
const crypto = require("crypto")
const { response } = require('express')
const { resolve } = require('path')

exports.uniqueName = function (filepath) {
    return new Promise((resolve) => {
        let filenamehash = crypto.createHash('md5').update(filepath).digest('hex').slice(0, 4)
        let md5sum = crypto.createHash('md5')
        let readfile = fs.ReadStream(filepath)
        readfile.on('data', (data) => {
            md5sum.update(data)
        })
        readfile.on("end", () => {
            filehash = md5sum.digest("hex").slice(0, 4)
            let re = filehash + filenamehash
            resolve(re)
            
        })

    })
}