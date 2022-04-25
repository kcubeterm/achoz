const express = require('express')
const app = express()
const path = require('path')
const fetch = require('node-fetch')
const fs = require('fs')
const os = require('os')
const conf = require(__dirname + "/setconfig").conf
const searchEngine = require(__dirname + '/lib/search-engine-wrapper.js').meilisearch

conf()



app.get('/', landing);
app.get('/search', search);
app.get('/search-api', searchApi);
app.get('/video', videoPlayer)
app.get('/filereq', filereq);

app.use("/public", express.static(appRoot + '/public'))
app.listen(port, () => {
    console.log(`Server is running on ${port}`)
})

function landing(req, res) {
    res.sendFile(appRoot + '/public/html/index.html')
}

function search(req, res) {

    res.sendFile(appRoot + '/public/html/search.html')
}

function searchApi(req, res) {

    var input = req.query.q
    var pageNo = req.query.page || 1;
    const search = new searchEngine() 
    search.normaliseSearch(input, pageNo)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            console.log(err);
        });


}

function filereq(req, res) {
    var id = req.query.id
    url = `${typesenseHost}/collections/${collectionName}/documents/${id}`
    fetch(url, {
        headers: {
            'X-TYPESENSE-API-KEY': TypesenseApi 
        }
    }).then(function (response) {
        return response.json();
    })
        .then(function (data) {
            console.log(data.abspath)
            res.sendFile(`${data.abspath}`);
        }).catch(function (err) {
            console.log(err);
        });
}
function videoPlayer(req, res) {
    res.sendFile(appRoot + '/public/html/video.html')
}
