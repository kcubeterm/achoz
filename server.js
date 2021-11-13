const express = require('express')
const app = express()
const path = require('path')
const appRoot = require('app-root-path');
const fetch = require('node-fetch')

port = 8080
app.get('/', landing);
app.get('/search', search);
app.get('/search-api', searchApi);

//app.use(express.static(`${appRoot}/public`))
app.use("/public", express.static('public'))
app.listen(port, () => {
    console.log('app is running on 8080')
})

function landing(req, res) {
    res.sendFile(appRoot + '/public/index.html')
}

function search(req, res) {

    res.sendFile(appRoot + '/public/search.html')
}

function searchApi(req, res) {

    var typesense_api = 'VyC9h8Fy83QTK8rN9HRqBgXmvcNrbED4JDXKfW6K6DLLVpRl'
    var input = req.query.q
    var page_no = req.query.page || 1;
    url = `https://achoz.ahoxus.org/search/collections/files/documents/search?q=${input}&query_by=FileName&page=${page_no}`
    fetch(url, {
        headers: {
            'X-TYPESENSE-API-KEY': typesense_api  // demo 
        }
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            console.log(err);
        });
}