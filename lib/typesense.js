

const fs = require("fs")
const fetch = require("node-fetch")
const readline = require('readline')
const conf = require(__dirname + "/../setconfig").conf
const linecounter = require(__dirname + "/line.js").linecounter
conf()

const metaurl = `${TypesenseHost}/collections/test/documents`

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
        "name": collection_name,
        "fields": [
            { "name": "name", "type": "string" },
            { "name": "abspath", "type": "string" },
            { "name": "uniqid", "type": "string" },
            { "name": "atime", "type": "string" },
            { "name": "ctime", "type": "string" },
            { "name": "mtimeMs", "type": "float" },
            { "name": "type", "type": "string", "facet": true },
            { "name": "content", "type": "string", "optional": true }

        ],
        "default_sorting_field": "mtimeMs"
    }
    let data = JSON.stringify(jsonData)
    console.log(data)
    let url = `${TypesenseHost}/collections`
    console.log(url)
    fetch(url, {
        method: "post",
        headers: {
            'X-TYPESENSE-API-KEY': Typesense_api,
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

    let url = `${TypesenseHost}/collections/test/documents/${id}`
    console.log(url)
    fetch(url, {
        method: "DELETE",
        headers: {
            'X-TYPESENSE-API-KEY': Typesense_api

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

var indexDoc = function (jsonlnfile) {
    let line = 0
    let collectUniqidOfIndexedDoc = {}
    collectUniqidOfIndexedDoc.arrayList = []
    var isIndexDB = fs.existsSync(achozDataDir + "/indexedDB.json")

    if (isIndexDB) {
        var indexedDb = JSON.parse(fs.readFileSync(achozDataDir + "/indexedDB.json"))

    }
    linecounter(jsonlnfile).then(tline => {

        let totalLine = tline
        jsonDoc = readline.createInterface({
            input: fs.createReadStream(jsonlnfile)
        })

        jsonDoc.on('line', jsonstring => {
            
            let parse = JSON.parse(jsonstring)
            let uniqid = parse.uniqid
            let abspath = parse.abspath

            if (isIndexDB) {

                if (indexedDb.arrayList.includes(uniqid)) {
                    console.log(abspath + "  already indexed")
                    line++
                } else {
                    corefuncforindedxing()
                }

            } else {
                corefuncforindedxing()
            }


            function corefuncforindedxing() {

                fetch(`${TypesenseHost}/collections/${collection_name}/documents/import?action=create`, {
                    method: "post",
                    headers: {
                        'X-TYPESENSE-API-KEY': Typesense_api
                    },
                    body: jsonstring
                }).then(res => {
                    return res.json()
                }).then(res => {

                    line++
                    if (res.success == true) {
                        console.log({ line })
                        console.log(abspath + "    Successfully indexed")
                        collectUniqidOfIndexedDoc.arrayList.push(uniqid)
                        console.log(uniqid)
                    } else {
                        console.warn(abspath + "    cannot indexed")

                    }
                    if (totalLine == line) {
                        console.log("end")
                        fs.writeFileSync(achozDataDir + "/indexedDB.json", JSON.stringify(collectUniqidOfIndexedDoc))
                        process.exit()
                    }
                })
                    .catch(err => {

                        console.log(err)
                    })
            }
        })

    })


}
