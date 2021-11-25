const express = require('express')
const app = express()
const path = require('path')
const appRoot = require('app-root-path');
const fetch = require('node-fetch')
const fs = require('fs')




try {
    var config = fs.readFileSync(`${appRoot}/config.json`, 'utf8')
} catch (err) {
    if (err.code == 'ENOENT') {
        return console.log("config.json not found");
    }
}

config = JSON.parse(config);
TypesenseHost = config.TypesenseHost
Typesense_api = config.TypesenseApi
Port = config.AchozPort



app.get('/', landing);
app.get('/search', search);
app.get('/search-api', searchApi);
app.get('/video', videoPlayer)
app.get('/filereq', filereq);

//app.use(express.static(`${appRoot}/public`))
app.use("/public", express.static('public'))
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
    // typesense url 
    url = `${TypesenseHost}/collections/test/documents/\
search?q=${input}&query_by=name,content&exclude_fields=content&highlight_fields=content&\
page=${page_no}&highlight_affix_num_tokens=10&highlight_start_tag=<b>&highlight_end_tag=</b>`

    fetch(url, {
        headers: {
            'X-TYPESENSE-API-KEY': Typesense_api  // demo 
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
    console.log(id)
    url = `${TypesenseHost}/collections/test/documents/${id}`
    fetch(url, {
        headers: {
            'X-TYPESENSE-API-KEY': Typesense_api  // demo 
        }
    }).then(function (response) {
        return response.json();
    })
        .then(function (data) {
            res.sendFile(data.abspath);
        }).catch(function (err) {
            console.log(err);
        });
}
function videoPlayer(req, res) {
    res.sendFile(appRoot + '/public/video.html')    
}