const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawnSync
const officeParser = require('officeparser');
const {
    convert
} = require('html-to-text')
const appRoot = require('app-root-path');
const os = require('os')
const hidefile = require('hidefile')
writeJsonData = fs.createWriteStream("/tmp/IndexData.jsonln")

function init() {
    var defaultConfig = `${appRoot}/config.json`
    var userConfig = fs.existsSync(os.homedir + '/.achoz/config.json')
    configPath = userConfig ? os.homedir + '/.achoz/config.json' : defaultConfig
    console.log(configPath)
    const config = require(configPath)

    var absDir = []
    config.DirToIndex.forEach((dir, index) => {
        var dir = dir.replace("~", os.homedir())
        absDir.push(path.resolve(dir));
    });
    let uniqueDir = [...new Set(absDir)]
    var filelist = [];
    uniqueDir.forEach((dir, index) => {
        file = walkSync(dir + '/')
        filelist = filelist.concat(file);


    });
    let uniqueFilelist = [...new Set(filelist)]
    jsonWriter(uniqueFilelist)
    localFileIndexer("/tmp/filelist.json")
}

var walkSync = function (dir, filelist) {
    var fs = fs || require('fs'),
        files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function (file) {
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
            stdout1 = spawn("file", ["--mime-type", filePath]).stdout.toString()
            var mimeType = stdout1.split(':')[1].trim();
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
    fileinfo.mtimeMs = stats.mtimeMs
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
    
    content = spawn("antiword", [filePath]).stdout.toString()
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
    try {
        
        content = spawn("antiword", [filePath]).stdout.toString()
        fileinfo.content = content.replace(/\s+/g, " ")
    } catch (err) {
        console.log(err)
        return;
    }
    fileinfo.type = 'pdf';
    writeMetadata(fileinfo);

}

function compressedFileHandler(filePath) {
    return defaultFileHandler(filePath, 'compressed')

    // TODO
}

function xmlHandler(filePath) {
    return defaultFileHandler(filePath, 'xml')
    // TODO

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
