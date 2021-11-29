
const spawn = require("child_process").spawnSync
function escapeRegExp(text) {
    return text.replace(/[-[\]{}()*+?.&,\\^$|#\s]/g, '\\$&');
  }
var filePath = "/home/kcubeterm/project/achoz/crawler/sample/FROZT, Andrew A - Sleeping Till Noon (feat. Moav) [NCS Release] [oUlYLcL7oj0].mp4"
// filePath = '/home/kcubeterm/exist'
//filePath = escapeRegExp(filePath)
console.log(filePath)
            stdout1 = spawn("file", ["--mime-type", filePath] ).stdout.toString()
            console.log(stdout1)
            var mimeType = stdout1.split(':')[1].trim();
            console.log(mimeType)