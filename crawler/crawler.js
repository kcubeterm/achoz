const fs = require('fs');
const path = require('path');
const spawnSync = require('child_process').spawnSync
const uniqueName = require(__dirname + '/../lib/unique-name').uniqueName
const officeParser = require('officeparser');
const {
    convert
} = require('html-to-text')
const os = require('os')
const hidefile = require('hidefile')
writeJsonData = fs.createWriteStream("/tmp/IndexData.jsonln")
const conf = require(__dirname + "/../setconfig").conf

conf()
function init() {
   

    var absDir = []
    config.DirToIndex.forEach((dir, index) => {
        if (fs.existsSync(dir)) {
            absDir.push(path.resolve(dir));
        }
    });
    let uniqueDir = [...new Set(absDir)]
    var filelist = [];
    uniqueDir.forEach((dir, index) => {
        file = listAllFilesInDir(dir + '/')
        filelist = filelist.concat(file);


    });
    let uniqueFilelist = [...new Set(filelist)]
    jsonWriter(uniqueFilelist)
    parseFilesList("/tmp/filelist.json")

}

var listAllFilesInDir = function (dir, filelist) {
    var fs = fs || require('fs'),
        files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function (file) {
        try {
            if (fs.statSync(dir + file).isDirectory()) {
                if (!hidefile.isDotPrefixed(file)) {
                    filelist = listAllFilesInDir(dir + file + '/', filelist);
                }
            } else {
                if (!hidefile.isDotPrefixed(file)) {
                    filelist.push(path.join(dir, "/", file));
                }
            }
        } catch (err) {
            console.log(err)
        }
    });

    return filelist;
};

var filesPathArray
var index = 0
function parseFilesList(arrayFilePath) {

    filesPathArray = JSON.parse(fs.readFileSync(arrayFilePath));
    var isIndexDB = fs.existsSync(achozDataDir + "/indexedDB.json")
    if (isIndexDB) {
        indexedDb = JSON.parse(fs.readFileSync(achozDataDir + "/indexedDB.json"))
        
    } else {
        indexedDb = false
    }
    
    coreCrawler(filesPathArray,index,indexedDb)
    
    
}
function coreCrawler(filesPathArray, index,indexedDb) {
    let filePath = filesPathArray[index]
    if (index < filesPathArray.length) {
        if (indexedDb) {

            if (indexedDb.arrayList.includes(uniqueName(filePath))) {
                console.log(filePath + "  already indexed")
            } else {
                console.log(filePath, index)
                universalFileSwitcher(filePath)
            }


        } else {
            console.log(filePath, index)
            universalFileSwitcher(filePath)
            
        }
    }
}

function writeMetadata(data) {
    writeJsonData.write(JSON.stringify(data) + "\n")
    // timeout is essential here as corecrawler is synchronus and block thread
    //  as a result write stream stores buffer in ram. 
    setTimeout(() => {
        index++
        coreCrawler(filesPathArray,index,indexedDb)
    }, 0.1);

}

function universalFileSwitcher(filePath) {
    var extension = path.extname(filePath).toLowerCase()
    switch (extension) {
        case '.htm':
        case '.html':
            htmlHandler(filePath);
            break;
        case '.xml':
            xmlHandler(filePath);
            break;
        case '.pdf':
            pdfHandler(filePath);
            break;
        case '.txt':
            textHandler(filePath);
            break;
        case '.doc':
            contnet = await docHandler(filePath);
            type = 'officedoc'
            break;
        case '.docx':
        case '.odt':
        case '.odp':
        case '.ods':
        case '.pptx':
        case '.xlsx':
            officeFileHandler(filePath);
            break;
        case '.zip':
        case '.tar':
        case '.gz':
            compressedFileHandler(filePath);
            break;
        // Files without extension or unrecognised extension will be 
        // processed through mimetypes
        default:
            let stdout1 = spawnSync("file", ["--mime-type", filePath]).stdout.toString()
            let mimeType = stdout1.split(':')[1].trim();
            mimeTypeSwitch(mimeType, filePath)

    }

    return;
}


function mimeTypeSwitch(mimeType, filePath) {
    if (mimeType.indexOf('text') != -1) {
        textHandler(filePath);

    } else if (mimeType.indexOf('msword') != -1) {
        docHandler(filePath);

    } else if (mimeType.indexOf('pdf') != -1) {
        pdfHandler(filePath);

    } else {
        defaultFileHandler(filePath, mimeType);
    }
}


function jsonWriter(json, whereToWrite) {
    var fileDestination = "/tmp/filelist.json"
    if (whereToWrite) {
        fileDestination = whereToWrite
    }

    try {
        fs.writeFileSync(fileDestination, JSON.stringify(json))
    } catch (err) {
        console.log(err)
    }
}


function getGeneralInfo(filePath) {
    let fileinfo = {}
    fileinfo.id = uniqueName(filePath)
    fileinfo.name = path.basename(filePath);
    fileinfo.abspath = path.resolve(filePath);
    let stats
    try {
      stats = fs.statSync(filePath);
    } catch (err) {
        if (err.code == 'ENOENT') {
            console.log(`${filePath} not found`);
            return;
        }
    }

    fileinfo.atime = stats.atime
    fileinfo.ctime = stats.ctime
    fileinfo.mtimeMs = stats.mtimeMs
    return fileinfo

}

function textHandler(filePath) {
    let fileinfo = getGeneralInfo(filePath)
    // console.log(fileinfo)
    if (typeof fileinfo == 'undefined') {
        return;

    }
    try {
        fileinfo.content = fs.readFileSync(filePath, 'utf8').replace(/\s+/g, " ");
    } catch (err) {
        console.err(err);
        return;
    }
    fileinfo.type = 'text'
    writeMetadata(fileinfo)

}

function htmlHandler(filePath) {
    let fileinfo = getGeneralInfo(filePath)
    if (typeof fileinfo == 'undefined') {
        return;
    }
    const htmls = fs.readFileSync(filePath, 'utf8');
    const texts = convert(htmls)

    fileinfo.content = texts.replace(/\s+/g, " ");
    fileinfo.type = 'html'
    writeMetadata(fileinfo);

}

function docHandler(filePath) {
    let fileinfo = getGeneralInfo(filePath)
    if (typeof fileinfo == 'undefined') {
        return;
    }
    try {
        command = spawnSync("antiword", [filePath, '-']).stdout.toString()
        fileinfo.content = command.replace(/\s+/g, " ")
        fileinfo.type = 'officedoc';
        writeMetadata(fileinfo);

    } catch (error) {
        console.log(filepath)
        console.log(error)

    }


}

function officeFileHandler(filePath, callback) {
    let fileinfo = getGeneralInfo(filePath)
    if (typeof fileinfo == 'undefined') {
        console.log('fileinfo getting undefined')
        return;
    }
    officeParser.setDecompressionLocation("/tmp");
    officeParser.parseOffice(filePath, (data, err) => {
        if (err) {
            return console.log(err);
        }
        fileinfo.content = data.replace(/\s+/g, " ").toString()
        fileinfo.type = 'officedoc'
        writeMetadata(fileinfo);
    });


}

function pdfHandler(filePath) {

    let fileinfo = getGeneralInfo(filePath)
    if (typeof fileinfo == 'undefined') {
        return;
    }
    try {

        let command = spawnSync("pdftotext", [filePath, '-']).stdout.toString()
        fileinfo.content = command.replace(/\s+/g, " ")
        fileinfo.type = 'pdf';
        writeMetadata(fileinfo);


    } catch (err) {
        console.log(err)
        return
    }


}

function compressedFileHandler(filePath) {
    return defaultFileHandler(filePath, 'compressed')

    // TODO
}

function xmlHandler(filePath) {
    return defaultFileHandler(filePath, 'xml')
    // TODO

}
async function docHandler(filePath) {
    let fileinfo = getGeneralInfo(filePath)
    try {
        command = spawnSync("antiword", [filePath, '-']).stdout.toString()
        content = command.replace(/\s+/g, " ")
    
    } catch (error) {
        console.log(filepath)
        console.log(error)
        return;

    }
    return content;


}
function defaultFileHandler(filePath, filetype) {
    let fileinfo = getGeneralInfo(filePath)
    if (typeof fileinfo == 'undefined') {
        return;
    }
    if (filetype) {
        fileinfo.type = filetype;
    }
    writeMetadata(fileinfo);

}

init()