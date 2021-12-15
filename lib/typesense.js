

const fs = require("fs")
const fetch = require("node-fetch")
const conf = require(__dirname + "/../setconfig").conf

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
                resolve(data);
            })
            .catch(function (err) {

                reject(err)
            });
    })
}


exports.createCollection = function(jsonData) {
    let data = JSON.stringify(jsonData)
    let url = `${TypesenseHost}/collections`
    fetch(url, {
        method: "POST",
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
            resolve(data);
        })
        .catch(function (err) {

            reject(err)
        });
}

exports.deleteDoc = function(id) {
    let url = `${metaurl}/${id}`
    fetch((url, {
        method: "DELETE",
        headers: {
            'X-TYPESENSE-API-KEY': Typesense_api

        }
    })).then((response) => {

        return response.json();
    })
        .then((data) => {
            console.log(data);
        })
        .catch((err) => {

            reject(err)
        })
}


exports.indexDb = function () {

    let url = `${TypesenseHost}/collections/test`
    fetch(url, {
        headers: {
            'X-TYPESENSE-API-KEY': Typesense_api
        }
    }).then((response) => {

        return response.json()

    }).then((bigdata) => {
        obj = {}

        for (let id = 0; id < bigdata.num_documents; id++) {
            url = `${TypesenseHost}/collections/test/documents/${id}`

            fetch(url, {
                headers: {
                    'X-TYPESENSE-API-KEY': Typesense_api
                }
            }).then((response) => {
                return response.json()

            }).then((data) => {

                uniqid = data.uniqid
                obj[uniqid] = data.id
                if (Object.keys(obj).length == bigdata.num_documents) {
                    fs.writeFileSync(achozDataDir + "/indexedDB.json", JSON.stringify(obj))

                }


            }).catch((err) => {
                console.log(err)
            })
        }


    }).catch((err) => {
        console.log(err)
    })
}

