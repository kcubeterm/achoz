const fs = require('fs')

exports.linecounter = function (filePath){
    return new Promise((resolve, reject) => {
    let lineCount = 0;
    fs.createReadStream(filePath)
      .on("data", (buffer) => {
        let idx = -1;
        lineCount--; 
        do {
          idx = buffer.indexOf(10, idx+1);
          lineCount++;
        } while (idx !== -1);
      }).on("end", () => {
        resolve(lineCount);
      }).on("error", reject);
    });
  };

