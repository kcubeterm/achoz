#!/usr/bin/env node

const fetch = require("node-fetch");
const fs = require('fs')
const os = require('os')
const spawn = require('child_process').spawn;
const conf = require(__dirname + "/setconfig").conf
const path = require('path')

conf()

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
if (!fs.existsSync(achozDataDir)) {
    fs.mkdirSync(achozDataDir)
    fs.mkdirSync(achozDataDir + '/searchdb')
    fs.copyFileSync(appRoot + '/config.json', achozDataDir + '/config.json')

    config.TypesenseApi = createApiKey(40)
    filename = os.homedir + '/.achoz/config.json'

    fs.writeFileSync(filename, JSON.stringify(config, null, 2));


    process.exit(0)
}
if (!fs.existsSync(achozDataDir + '/searchdb')) {
    fs.mkdirSync(achozDataDir + '/searchdb')
}

// command line interface

switch (process.argv[2]) {
    case 'add':
        addDirForCrawl(process.argv[3])
        break;
    case 'engine':
        startSearchEngine()
        server()
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

    case 'help':
        help()
        break;

    case 'version':
        version()
        break;

    default:
        help()
        break;
}



function startSearchEngine() {
    spawn('pkill', ["typesense-server"]).on(('close'), () => {

        searchEngine = spawn("typesense-server", ['--data-dir', `${achozDataDir}/searchdb`, '--api-key', `${TypesenseApi}`, "--api-port", "8909"])
        searchEngine.stderr.pipe(process.stdout)
        searchEngine.stdout.pipe(process.stdout)
        searchEngine.on('exit', (exit) => {
            console.warn("report error")
            process.exit(1)
        })
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

function help() {

    let helpMessage = ` 
    Usage: achoz [command]

     help      Print help message
     crawl     Crawl all directory which is mentioned in configuration 
     index     Index all data and content which has crawled in achoz search engine
     engine    Start web interface at port ${Port} (change port in config)
     version   Show version of achoz 

     Note: Default configuration is in ~/.achoz/config.json

    Examples:
     Step 1: Crawl your data. 

        You must have to crawl all or some of your data to so that achoz will show some result when you will look something 
        for that run achoz with crawl eg; achoz crawl 
        It will crawl all directory which is assigned in configuration file.

     Step 2: Index crawled documents

        In order to index you just need to run achoz with index command eg; achoz index
        Note: You dont need to run step 1 and 2 each time to start web interface unless you update directory info in config file

     Step 3: Start server 

            Now run achoz server/engine with command engine eg: achoz engine 
    

    Achoz online help:  https://github.com/kcubeterm/achoz
    Report issues/bug:  https://github,com/kcubeterm/issues
    Full documentation: https://github.com/kcubeterm/achoz/wiki

    
   `
    console.log(helpMessage)

}

function version() {
    let pkgjson = require(appRoot + '/package.json')
    console.log("achoz " + pkgjson.version)
}

function addDirForCrawl(dir) {
    let absPath = path.resolve(dir)
    config.DirToIndex.push(absPath)
    fs.writeFileSync(configPath, config)


}