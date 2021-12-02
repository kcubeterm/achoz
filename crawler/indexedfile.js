const uniqueName = require("../lib/unique-name").uniqueName
var lol
const fs = require('fs')
const path = require('path')
uniqueName("crawler.js").then((d) => {
    console.log(d)
    lol = d 
})
console.log('oanl')
console.log(lol)

function getGeneralInfo(filePath) {
    var fileinfo = {}
    fileinfo.name = path.basename(filePath);
    fileinfo.abspath = path.resolve(filePath);
    try {
        var stats = fs.statSync(filePath);
    } catch (err) {
        if (err.code == 'ENOENT') {
            console.log(`${filePath} not found`);
            return;
        }
    }
    uniqueName(filePath).then((d) => {
        fileinfo.uniqid = d 

        fileinfo.uniqid = uniqueName(filePath)
        fileinfo.atime = stats.atime
        fileinfo.ctime = stats.ctime
        fileinfo.mtimeMs = stats.mtimeMs
        return fileinfo
    }).then((e) => {
        console.log(e)
    })

}
console.log(getGeneralInfo('./crawler.js'))