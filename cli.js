#!/usr/bin/env node

const exec = require('child_process').exec;
const fetch = require("node-fetch");
const fs = require('fs')
const os = require('os')


const appRoot = __dirname
var defaultConfig = `${appRoot}/config.json`
var userConfig = fs.existsSync(os.homedir + '/.achoz/config.json')
configPath = userConfig ? os.homedir + '/.achoz/config.json' : defaultConfig
const config = require(configPath)


TypesenseHost = config.TypesenseHost;
TypesenseApi = config.TypesenseApi;

var achozdir = os.homedir + '/.achoz'
function createApiKey(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
        charactersLength));
    }
    return result;
}
if (!fs.existsSync(achozdir)) {
    fs.mkdirSync(achozdir)
    fs.mkdirSync(achozdir + '/searchdb')
    fs.copyFileSync(appRoot + '/config.json', achozdir + '/config.json')
    
    config.TypesenseApi = createApiKey(40)
    filename = os.homedir + '/.achoz/config.json'
    
    fs.writeFileSync(filename, JSON.stringify(config, null, 2));
    
    
    process.exit(0)
}
if (!fs.existsSync(achozdir + '/searchdb')) {
    fs.mkdirSync(achozdir + '/searchdb')
}

function startSearchEngine() {
    searchEngine = `typesense-server -d ${achozdir}/searchdb -c ${achozdir}/config.json -a ${TypesenseApi} --api-port 8909`
    exec(searchEngine, (err, stdout, stderr) => {
        if (err) {
            console.log('typesense server could not run')
            console.warn(err)
        }
    }).stdout.on('data', function (data) {
        console.log(data);
    });
    setTimeout(health, 5000)
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
                console.log("typesense engine is not running")
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
        exec(`bash ${appRoot}/crawler/indexer.sh ${os.homedir}/.achoz`, (err, stdout, stderr) => {
            if (err) {
                console.warn(err) //TODO ^ above should be var
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