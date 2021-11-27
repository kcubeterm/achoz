#!/usr/bin/env node

const appRoot = require('app-root-path');
const exec = require('child_process').exec;
const fetch = require("node-fetch");
const fs = require('fs')
const os = require('os')



var defaultConfig = `${appRoot}/config.json`
var userConfig = fs.existsSync(os.homedir + '/.achoz/config.json')
configPath = userConfig ? userConfig : defaultConfig
console.log(configPath)
const config = require(configPath)

TypesenseHost = config.TypesenseHost;
Typesense_api = config.TypesenseApi;

var achozdir = os.homedir + '/.achoz'

if (!fs.existsSync(achozdir)) {
    fs.mkdirSync(achozdir)
    fs.mkdirSync(achozdir + '/searchdb')
    fs.copyFileSync(appRoot + '/config.json', achozdir)
}


function startSearchEngine() {
    searchEngine = `typesense-achoz -d ${achozdir}/searchdb -c ${achozdir}/config.json`
    exec('typesense-achoz', (err, stdout, stderr) => {
        if (err) {

            console.warn(err)
        }
    }).stdout.on('data', function (data) {
        console.log(data);
    });
    health()
}

// checking health of search engine 
function health() {
    var url = `${TypesenseHost}/health`
    fetch(url)
        .then((response) => {
            return response.json()
        })
        .then((data) => {
            if (data.ok) {
                console.log("Search engine's health is fine ")
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
        exec(`bash ${appRoot}/crawler/collections.sh ${achozdir}`, (err, stdout, stderr) => {
            if (err) {
                console.warn(err)
            }
        }).stdout.on('data', function (data) {
            console.log(data);
        });
    }).then(() => {

        console.log('Indexing documents')
        exec(`bash ${appRoot}/crawler/indexer.sh ${achozdir}`, (err, stdout, stderr) => {
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

startSearchEngine()