#!/usr/bin/env node

const fetch = require("node-fetch");
const fs = require('fs')
const os = require('os')
const spawn = require('child_process').spawn

const appRoot = __dirname
const createIndexObj = require(appRoot + '/lib/typesense').indexDb
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

// command line interface

switch (process.argv[2]) {
    case 'engine':
        startSearchEngine()
        break;
    case 'crawl':
        console.log("Start crawling your document. please wait.....");
        crawler()
        break;
    case 'index':
        console.log("please wait....")
        engineHealth(indexer)
        break;

    case 'start':
        console.log("starting achoz server.......")
        engineHealth(server)
        break;
    default:
        break;
}



function startSearchEngine() {
    spawn('pkill', ["typesense-server"])
    searchEngine = spawn("typesense-server", ['--data-dir', `${achozdir}/searchdb`, '--api-key', `${TypesenseApi}`, "--api-port", "8909"])
    searchEngine.stderr.pipe(process.stdout)
    searchEngine.stdout.pipe(process.stdout)
    searchEngine.on('exit', (exit) => {
        console.warn("report error")
        process.exit(1)
    })

}

function indexer() {
    // wont override existing collection if already exist
    let createCollection = spawn('bash', [`${appRoot}/crawler/collections.sh`, `${os.homedir}/.achoz`])
    createCollection.stdout.pipe(process.stdout)
    createCollection.on('close', (code) => {
        let coreIndexer = spawn('bash', [`${appRoot}/crawler/indexer.sh`, `${os.homedir}/.achoz`])
        coreIndexer.stdout.pipe(process.stdout)
        coreIndexer.on('error', (err) => {
            console.error(err)
        })
        coreIndexer.on('close', (code) => {
            createIndexObj()
            console.log(`indexing done or any error ${code}`)
           
        })
    })
}



function crawler() {
    crawlProcess = spawn('node', [`${appRoot}/crawler/crawler.js`])
    crawlProcess.stdout.pipe(process.stdout)
    crawlProcess.stderr.pipe(process.stdout)
}

function server() {
    console.log('...')
    crawlProcess = spawn('node', [`${appRoot}/server.js`])
    crawlProcess.stdout.pipe(process.stdout)
    crawlProcess.stderr.pipe(process.stdout)
}


function engineHealth(callback) {
    console.log(",,")
    var url = `${TypesenseHost}/health`

    fetch(url)
        .then((response) => {
            return response.json()

        })
        .then((data) => {
            if (data.ok) {
                console.log('Engine health is fine()')
                callback()
            }
        })
        .catch((err) => {
            console.log(err)
            console.log('achoz engine is not running, run it by command "achoz engine"')

        })
}

