const fs = require('fs');
const path = require('path');
//const tr = require('textract')
const exec = require('child_process').exec

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

//out = JSON.stringify(walkSync("./"));
//fs.writeFileSync('lol.js', out);

function localFileIndexer(arrayFilePath) {
	array_output = JSON.parse(fs.readFileSync(arrayFilePath));

	for (let i = 0; i < array_output.length; i++ ) {
		console.log(array_output[i])
	
	}
}
/// Function responsible for text based file indexing

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
		case '.docx':
		case '.odt':
		case '.odp':
		case '.ods':
		case '.ppt':
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
	fileinfo.type = text
	jsonWriter(fileinfo);
}

function htmlHandler(filePath) {
	console.log(filePath)	
}

function officeFileHandler(filePath) {
	var fileinfo = getGeneralInfo(filePath);
	const officeParser = require('officeparser');

	officeParser.parseOffice(filepath, function(data, err){
        // "data" string in the callback here is the text parsed from the office file passed in the first argument above
        if (err) return console.log(err);
        fileinfo.content = data
        return jsonWriter(fileinfo);
})

}
function pdfHandler(filePath) {
	
}
// compressed files like .zip,.gz and tar file handler
function compressedFileHandler(filePath) {
	console.log(filePath)
}

console.log(universalFileIndexer('lolbcdfg.txt'))
//console.log(textHandler('sample.txt'))
//console.log(getGeneralInfo('sample.txt'))
