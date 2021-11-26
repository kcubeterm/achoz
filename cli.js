#!/usr/bin/env node

const appRoot = require('app-root-path');
const exec = require('child_process').exec;
const fetch = require("node-fetch");
const fs = require('fs')
try {
    var config = fs.readFileSync(`${appRoot}/config.json`, 'utf8');
} catch (err) {
    if (err.code == 'ENOENT') {
        return console.log("config.json not found");
    }
}

config = JSON.parse(config);
TypesenseHost = config.TypesenseHost;
Typesense_api = config.TypesenseApi;






// checking health of search engine 
function health() {
    var url = `${TypesenseHost}/health`
    fetch(url)
        .then((response) => {
            return response.json()
        })
        .then((data) => {
            if (data.ok) {
                console.log("Search engine is running ")
                server()
            } else {
                process.exit(1)
            }
        })
        .catch((err) => {
            console.log(err)
        })
}
function server() {

    let crawlerAndindexer = new Promise((resolve, reject) => {
        exec(`node ${appRoot}/crawler/crawler.js`, (err, stdout, stderr) => {
            if (err) {
                console.warn(err)
            }
            resolve();
        }).stdout.on('data', function (data) {
            console.log(data);
        });
        
    })
    
    crawlerAndindexer.then(() => {
        console.log('Indexing documents')
        exec(`bash ${appRoot}/crawler/indexer.sh`, (err, stdout, stderr) => {
            if (err) {
                console.warn(err)
            }
        }).stdout.on('data', function (data) {
            console.log(data);
        });
    
    }).then(() => {
        exec(`node ${appRoot}/server.js`).stdout.on('data', function (data) {
            console.log(data);
        })
    })

}    

health()