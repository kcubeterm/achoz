
const fetch = require("node-fetch")


const metaurl = `${TypesenseHost}/collections/test/documents`

function search(query, options) {
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


function createCollection(jsonData) {
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

function deleteDoc(id) {
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
            resolve(data);
        })
        .catch((err) => {

            reject(err)
        })
}