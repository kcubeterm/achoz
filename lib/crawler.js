const fs = require('fs');
const path = require('path');
const uniqueName = require(__dirname + '/unique-name').uniqueName
const officeParser = require('officeparser');
const hidefile = require('hidefile')
const {
    convert
} = require('html-to-text')
const os = require('os')
const conf = require(__dirname + "/../setconfig").conf

writeJsonData = fs.createWriteStream("/tmp/crawledData.ajsonln")

conf()
function init() {


    var absDir = []
    config.DirToIndex.forEach((dir, index) => {
        absDir.push(path.resolve(dir));

    });
    let uniqueDir = [...new Set(absDir)]
    var filelist = [];
    uniqueDir.forEach((dir, index) => {
        file = listAllFilesInDir(dir + '/')
        filelist = filelist.concat(file);

    });

    let uniqueFilelist = [...new Set(filelist)]
    jsonWriter(uniqueFilelist)
    parseFilenameArray("/tmp/filelist.json")

}
var listAllFilesInDir = function (dir, filelist) {
    var fs = fs || require('fs')
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
var filesPathArray
var index = 0
function parseFilenameArray(arrayFilePath) {

    filesPathArray = JSON.parse(fs.readFileSync(arrayFilePath));
    isIndexedContent = fs.existsSync(achozDataDir + "/indexedContent.json")
    if (isIndexedContent) {
        indexedContent = JSON.parse(fs.readFileSync(achozDataDir + "/indexedContent.json"))

    } else {
        isIndexedContent = false
    }

    coreCrawler(filesPathArray, index, isIndexedContent)


}
function coreCrawler(filesPathArray, index, isIndexedContent) {
    let filePath = filesPathArray[index]
    if (index < filesPathArray.length) {
        if (isIndexedContent) {

            if (indexedContent.arrayList.includes(uniqueName(filePath))) {
                console.log(filePath + "  already indexed")
                index++
                coreCrawler(filesPathArray, index, isIndexedContent)
            } else {
                console.log(filePath, index)
                universalFileReader(filePath)
            }


        } else {
            console.log(filePath, index)
            universalFileReader(filePath)

        }
    }
}



async function universalFileReader(filePath) {
    var extension = path.extname(filePath).toLowerCase()
    let content
    let type
    switch (extension) {
        case '.htm':
        case '.html':
            content = await htmlHandler(filePath);
            type = 'html'
            break;
        case '.xml':
            xmlHandler(filePath);
            break;
        case '.pdf':
            content = await pdfHandler(filePath);
            type = 'pdf'
            break;
        case '.txt':
            type = 'text'
            content = await textHandler(filePath);
            break;
        case '.doc':
            content = await docHandler(filePath);
            type = 'officedoc'
            break;
        // case '.docx':
        // case '.odt':
        // case '.odp':
        // case '.ods':
        // case '.pptx':
        // case '.xlsx':
        //     officeFileHandler(filePath);
        //     break;
        case '.zip':
        case '.tar':
        case '.gz':
            content = await compressedFileHandler(filePath);
            type = 'archive'
            break;
        // Files without extension or unrecognised extension will be 
        // processed through mimetypes
        default:
            content = 'null'
            type = 'unknown'

    }
    fileinfo = getGeneralInfo(filePath)
    if (fileinfo == 'undefined' || content == 'undefined') {
        index++
        coreCrawler(filesPathArray, index, isIndexedContent)
        return;
    }
    fileinfo.content = content
    fileinfo.type = type

    writeJsonData.write(JSON.stringify(fileinfo) + "\n")
    index++
    coreCrawler(filesPathArray, index, isIndexedContent)
    return;

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
// Handler

async function htmlHandler(filePath) {
    const htmls = fs.readFileSync(filePath, 'utf8');
    const texts = convert(htmls)

    return texts.replace(/\s+/g, " ");

}
async function textHandler(filePath) {
    try {
        content = fs.readFileSync(filePath, 'utf8').replace(/\s+/g, " ");
    } catch (err) {
        console.err(err);
        return;
    }
    return content;
}
async function pdfHandler(filePath) {
    try {
        let command = spawnSync("pdftotext", [filePath, '-']).stdout.toString()
        content = command.replace(/\s+/g, " ")

    } catch (err) {
        console.log(err)
        return
    }
    return content;

}
async function docHandler(filePath) {
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
async function compressedFileHandler(filepath) {

    return content = 'null'
}

init()

