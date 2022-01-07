

const fs = require("fs")
const fetch = require("node-fetch")
const readline = require('readline')
const conf = require(__dirname + "/../setconfig").conf
const linecounter = require(__dirname + "/line.js").linecounter
conf()

const metaurl = `${typesenseHost}/collections/test/documents`

exports.search = function (query, options) {
    let url = `${metaurl}/search?q=${input}&query_by=${query},${options}`
    return new Promise((resolve, reject) => {

        fetch(url, {
            headers: {
                'X-TYPESENSE-API-KEY': Typesense_api
            }
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                console.log(data);
            })
            .catch(function (err) {

                console.log(err)
            });
    })
}


exports.createCollection = function () {
    let jsonData = {
        "name": collectionName,
        "fields": [
            { "name": "id", "type": "string" },
            { "name": "name", "type": "string" },
            { "name": "abspath", "type": "string" },
            { "name": "atime", "type": "string" },
            { "name": "ctime", "type": "string" },
            { "name": "mtimeMs", "type": "float" },
            { "name": "type", "type": "string", "facet": true },
            { "name": "content", "type": "string", "optional": true }

        ],
        "default_sorting_field": "mtimeMs"
    }
    let data = JSON.stringify(jsonData)
    let url = `${typesenseHost}/collections`
   
    fetch(url, {
        method: "post",
        headers: {
            'X-TYPESENSE-API-KEY': typesenseApi,
            "Content-Type": "application/json"
        },
        body: data
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {

            indexDoc("/tmp/IndexData.jsonln")

        })
        .catch(function (err) {

            console.log(err)
        });
}

var deleteDoc = function (id) {

    let url = `${typesenseHost}/collections/test/documents/${id}`
    console.log(url)
    fetch(url, {
        method: "DELETE",
        headers: {
            'X-TYPESENSE-API-KEY': typesenseApi

        }
    }).then((response) => {

        return response.json();
    })
        .then((data) => {
            console.log(data);


        })
        .catch((err) => {

            console.log(err)
        })
}

function indexDoc(jsonlnFile) {
    let cannotIndexed = []
    let line = 0 // using as close event dont work reliably. 
    let collectUniqidOfIndexedDoc = {}
    collectUniqidOfIndexedDoc.arrayList = []
    var isIndexDB = fs.existsSync(achozDataDir + "/indexedDB.json")

    if (isIndexDB) {
        var indexedDb = JSON.parse(fs.readFileSync(achozDataDir + "/indexedDB.json"))

    }
    linecounter(jsonlnFile).then(tLine => {

        let totalLine = tLine
        jsonDoc = readline.createInterface({
            input: fs.createReadStream(jsonlnFile),
            crlfDelay: "infinity"
        })
        jsonDoc.on('close', () => {
            // unfortunately this is not reliavle with a big jsonln file. did't find 
            //any online reference yet
        })
        jsonDoc.on('line', jsonString => {

            let parse = JSON.parse(jsonString)
            let id = parse.id
            let abspath = parse.abspath

            if (isIndexDB) {

                if (indexedDb.arrayList.includes(id)) {
                    console.log(abspath + "  already indexed")
                    collectUniqidOfIndexedDoc.arrayList.push(id)
                    line++
                    fileEndBro()
                } else {
                    corefuncforindedxing()
                }

            } else {
                corefuncforindedxing()
            }


            function corefuncforindedxing() {

                fetch(`${typesenseHost}/collections/${collectionName}/documents/import?action=create`, {
                    method: "post",
                    headers: {
                        'X-TYPESENSE-API-KEY': typesenseApi
                    },
                    body: jsonString
                }).then(res => {
                    return res.json()
                }).then(res => {
                    line++
                    if (res.success == true) {

                        console.log(abspath + "    Successfully indexed")
                        collectUniqidOfIndexedDoc.arrayList.push(id)
                    
                    } else {
                        cannotIndexed.push(id)
                        console.warn(abspath + "    cannot indexed")


                    }
                   fileEndBro()
                })
                    .catch(err => {

                        console.log(err)
                    })
            }
            function fileEndBro() {
                if (totalLine == line) {
                        fs.writeFileSync(achozDataDir + "/indexedDB.json", JSON.stringify(collectUniqidOfIndexedDoc))
                        jsonDoc.close()
                        clearInterval(pauseInterval)
                        clearInterval(resumeInterval)
                        if (cannotIndexed.length > 0) {
                            indexDoc(jsonlnFile)
                        }
                    }
            }
        })
        var pauseInterval = setInterval(() => {
            jsonDoc.pause()
        }, 2000);
        var resumeInterval = setInterval(() => {
            jsonDoc.resume()
        }, 3000);
    })


}
