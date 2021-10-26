const express = require('express')
const app = express()
const path = require('path')
const appRoot = require('app-root-path');

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


    res.send(req.query)
}