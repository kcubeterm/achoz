const fs = require('fs');
const path = require('path');
const exec = require('child_process').execSync
const officeParser = require('officeparser');
const {
    convert
} = require('html-to-text')
const appRoot = require('app-root-path');
const os = require('os')
const hidefile = require('hidefile')
writeJsonData = fs.createWriteStream("IndexData.jsonln")

function init() {
    try {
        config = fs.readFileSync(`${appRoot}/config.json`, 'utf8')
    } catch (err) {
        if (err.code == 'ENOENT') {
            return console.log("config.json not found");
        }
    }

    config = JSON.parse(config);
    var absDir = []
    config.DirToIndex.forEach((dir, index) => {
        var dir = dir.replace("~", os.homedir())
        absDir.push(path.resolve(dir));
    });
    // Prevent repeation of dir
    let uniqueDir = [...new Set(absDir)]
    var filelist = [];
    uniqueDir.forEach((dir, index) => {
        //console.log(dir)
        file = walkSync(dir + '/')
        filelist = filelist.concat(file);


    });
    let uniqueFilelist = [...new Set(filelist)]
    //let uniqueFilelist = filelist
    jsonWriter(uniqueFilelist)
    localFileIndexer("filelist.json")
}

function watchDirChanges(dir) {

}
var walkSync = function(dir, filelist) {
    var fs = fs || require('fs'),
        files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function(file) {
        try {
            if (fs.statSync(dir + file).isDirectory()) {
                if (!hidefile.isDotPrefixed(file)) {
                    filelist = walkSync(dir + file + '/', filelist);
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

function localFileIndexer(arrayFilePath) {
    array_output = JSON.parse(fs.readFileSync(arrayFilePath));
    array_output.forEach((dir, index) => {
        console.log(dir, index)
        universalFileIndexer(dir)

    });
    fs.unlinkSync(arrayFilePath)
}

function writeMetadata(data) {
    data = JSON.stringify(data)
    writeJsonData.write(data + "\n")
}

function universalFileIndexer(filePath) {
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
            docHandler(filePath);
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
            exec(`file --mime-type ${filePath}`, (error, stdout, stderr) => {
                if (error) {
                    console.error(error)
                }
                if (stderr) {
                    console.error(stderr)
                }

                var mimeType = stdout.split(':')[1].trim();

                mimeTypeSwitch(mimeType, filePath);

            });

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
    var fileDestination = "filelist.json"
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
    fileinfo.atime = stats.atime
    fileinfo.ctime = stats.ctime
    fileinfo.mtime = stats.ctime
    return fileinfo

}

function textHandler(filePath) {
    var fileinfo = getGeneralInfo(filePath);
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
    var fileinfo = getGeneralInfo(filePath);
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
    var fileinfo = getGeneralInfo(filePath);
    if (typeof fileinfo == 'undefined') {
        return;
    }
    var content = exec(`antiword ${filePath}`, 'utf8').toString()
    fileinfo.content = content.replace(/\s+/g, " ")
    fileinfo.type = 'officedoc';
    writeMetadata(fileinfo);

}

function officeFileHandler(filePath, callback) {
    var fileinfo = getGeneralInfo(filePath);
    if (typeof fileinfo == 'undefined') {
        console.log('fileinfo getting undefined')
        return;
    }

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
    var fileinfo = getGeneralInfo(filePath);
    if (typeof fileinfo == 'undefined') {
        return;
    }
    var content = exec(`pdftotext ${filePath} -`, 'utf8').toString()
    fileinfo.content = content.replace(/\s+/g, " ")
    fileinfo.type = 'pdf';
    writeMetadata(fileinfo);

}

function compressedFileHandler(filePath) {
    return defaultFileHandler(filePath, 'compressed')

    // WIP
}

function xmlHandler(filePath) {
    return defaultFileHandler(filePath, 'xml')
    // WIP

}

function defaultFileHandler(filePath, filetype) {
    var fileinfo = getGeneralInfo(filePath);
    if (typeof fileinfo == 'undefined') {
        return;
    }
    if (filetype) {
        fileinfo.type = filetype;
    }
    writeMetadata(fileinfo);
}

init()