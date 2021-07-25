const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec
const officeParser = require('officeparser');




var walkSync = function(dir, filelist) {
  var fs = fs || require('fs'),
      files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(dir + file).isDirectory()) {
      filelist = walkSync(dir + file + '/', filelist);
    }
    else {
      filelist.push(path.join(__dirname, dir, "/", file));
    }
  });
  return filelist;
};

function localFileIndexer(arrayFilePath) {
	array_output = JSON.parse(fs.readFileSync(arrayFilePath));

	for (let i = 0; i < array_output.length; i++ ) {
		console.log(array_output[i])
	
	}
}
function universalFileIndexer (filePath) {
	var extension = path.extname(filePath).toLowerCase()
	switch (extension) {
		case '.htm':
		case '.html':
			return	htmlhandler(filePath);
			break;
		case '.xml':
			return xmlHandler(filePath);
			break;
		case '.pdf':
			return pdfHandler(filePath);
			break;
		case '.txt':
			return textHandler(filePath);
			break;
		case '.doc':
			return docHandler(filePatb);
			break;
		case '.docx':
		case '.odt':
		case '.odp':
		case '.ods':
		case '.pptx':
		case '.xlsx':
			return officeFileHandler(filePath);
			break;
		case '.zip':
		case '.tar':
		case '.gz':
			return compressedFileHandler(filePath);
			break;
			// Files without extension or unrecognised extension will be 
			// processed through mimetypes
		default: 
			exec(`file --mime-type ${filePath}`, (error, stdout, stderr ) => {
				if (error) {
					console.error(error)
				}	
				if (stderr) {
					console.error(stderr)
				}
				
				mimeType = stdout.split(':')[1].trim();
						
				mimeTypeSwitch(mimeType, filePath);
				
			});
			
		}
		
	return;
}

function mimeTypeSwitch(mimeType,filePath) {
	if (mimeType.indexOf('text') != -1) {
		textHandler(filePath);
		
	} else if (mimeType.indexOf('msword') != -1 ) {
		docHandler(filePath);
		
	} else if (mimeType.indexOf('pdf') != -1 ) {
		pdfHandler(filePath);
		
	} else {
		defaultFileHandler(filePath);
	}
}


function jsonWriter(json) {
	
	return ;
}


function getGeneralInfo(filePath) {
        var fileinfo = {}
        fileinfo.name = path.basename(filePath);
        fileinfo.abspath = path.resolve(filePath);
		try {
        var stats = fs.statSync(filePath);
        } catch (err) {
        	console.log(err)
        	return;
        }
        fileinfo.atime = stats.atime
        fileinfo.ctime = stats.ctime
        fileinfo.mtime = stats.ctime
        return fileinfo
	
}

function textHandler(filePath) {
	var	fileinfo = getGeneralInfo(filePath);
	if ( typeof fileinfo == 'undefined') {
		return;
		
	}
	try {
		fileinfo.content = fs.readFileSync(filePath, 'utf8').trim();
	} catch (err) {
		console.err(err);
		return;
	}
	fileinfo.type = 'text'
	jsonWriter(fileinfo);
}

function htmlHandler(filePath) {
	console.log(filePath)	
}
function docHandler(filePath){
        var fileinfo = getGeneralInfo(filePath);
        if (typeof fileinfo == 'undefined') {
                return;
        }
        exec(`antiword ${filePath}`, (err, stdout, stderr) => {
        if (err) {
                console.log(err)
                return;
        }
        if (stderr) {
                console.log(err)
                return;
        }

        fileinfo.content = stdout.replace(/\s+/g, " ")
        fileinfo.type = doc;
        jsonWriter(fileinfo);
        })

}

function officeFileHandler(filePath) {
	var fileinfo = getGeneralInfo(filePath);
	if (typeof fileinfo == 'undefined') {
		return;
	}

	officeParser.parseOffice(filepath, function(data, err){
        // "data" string in the callback here is the text parsed from the office file passed in the first argument above
        if (err) return console.log(err);
        fileinfo.content = data
        return jsonWriter(fileinfo);
	});

}

function pdfHandler(filePath){
	var fileinfo = getGeneralInfo(filePath);
    if (typeof fileinfo == 'undefined') {
    	return;   
    }
    exec(`pdftotext ${filePath} - `, (err, stdout, stderr) => {
        if (err) {
                console.log(err)
                return;
        }                                                                     if (stderr) {
                console.log(err)
                return;
        }

        fileinfo.content = stdout.replace(/\s+/g, " ")
        fileinfo.type = pdf;
        jsonWriter(fileinfo);
        });

}
function compressedFileHandler(filePath) {
	console.log(filePath)
}


function defaultFileHandler(filepath) {
	fileinfo = getGeneralinfo(filepath);
	if (typeof fileinfo == 'undefined') {
		return;
	}
	return jsonWriter(fileinfo)
}
console.log(universalFileIndexer('sample.txt'))


