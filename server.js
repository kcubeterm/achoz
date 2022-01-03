const express = require('express')
const app = express()
const path = require('path')
const fetch = require('node-fetch')
const fs = require('fs')
const os = require('os')
const conf = require(__dirname + "/setconfig").conf

conf()



app.get('/', landing);
app.get('/search', search);
app.get('/search-api', searchApi);
app.get('/video', videoPlayer)
app.get('/filereq', filereq);

app.use("/public", express.static(appRoot + '/public'))
app.listen(Port, () => {
    console.log(`Server is running on ${Port}`)
})

function landing(req, res) {
    res.sendFile(appRoot + '/public/index.html')
}

function search(req, res) {

    res.sendFile(appRoot + '/public/search.html')
}

function searchApi(req, res) {

    var input = req.query.q
    var page_no = req.query.page || 1;
    url = `${TypesenseHost}/collections/${collection_name}/documents/\
search?q=${input}&query_by=name,content&exclude_fields=content&highlight_fields=content&\
page=${page_no}&highlight_affix_num_tokens=10&highlight_start_tag=<b>&highlight_end_tag=</b>`

    fetch(url, {
        headers: {
            'X-TYPESENSE-API-KEY': Typesense_api 
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

function filereq(req, res) {
    var id = req.query.id
    url = `${TypesenseHost}/collections/${collection_name}/documents/${id}`
    fetch(url, {
        headers: {
            'X-TYPESENSE-API-KEY': Typesense_api 
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
    res.sendFile(appRoot + '/public/video.html')
}