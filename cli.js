#!/usr/bin/env node

const fetch = require("node-fetch");
const fs = require('fs')
const os = require('os')
const spawn = require('child_process').spawn;
const conf = require(__dirname + "/setconfig").conf
const path = require('path');
const ts = require(__dirname + "/lib/typesense.js")
const searchEngine = require(__dirname + "/lib/search-engine-wrapper").meilisearch

conf()
var SE = new searchEngine()
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
// check few essential files and variable. if not there create it. 
if (!fs.existsSync(achozDataDir)) {
    fs.mkdirSync(achozDataDir)
    fs.mkdirSync(achozDataDir + '/searchdb')
    fs.copyFileSync(appRoot + '/config.json', achozDataDir + '/config.json')
   
    config.TypesenseApi = createApiKey(40)
    config.meiliApi = createApiKey(40)
    filename = os.homedir + '/.achoz/config.json'
    fs.writeFileSync(filename, JSON.stringify(config, null, 2));


    console.log('Config file not found, created at ~/.achoz/config.json')
    console.log("Now good to go. ")
    process.exit(0)
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
        crawler()

        break;
    case 'index':
        engineHealth(indexer)
        break;

    case 'start':
        console.log("starting achoz server.......")
        engineHealth(server)
        break;

    case 'help':
        help()
        break;
    case 'update':
        ts.indexDb()
        break
    case 'version':
        version()
        break;
    case "list":
        listDir()
        break
    case 'remove':
        removeDirConfig(process.argv[3])
        break
    default:
        help()
        break;
}



function startSearchEngine() {
    spawn('pkill', ["meilisearch"]).on(('close'), () => {

        searchEngine = spawn("meilisearch", ['--db-path', `${achozDataDir}/data.ms`, '--master-key', `${meiliApi}`, "--http-addr", `${meiliAddr}`, "--env", "production" , "--no-analytics"])
        searchEngine.stderr.pipe(process.stdout)
        searchEngine.stdout.pipe(process.stdout)
        searchEngine.on('exit', (exit) => {
            console.warn("report error")
            process.exit(1)
        })
    })

}

function indexer() {

    SE.indexer()
}




function crawler() {
    crawlProcess = spawn('node', ['--no-warnings',`${appRoot}/lib/crawler.js`])
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
    meiliclient.health()
        .then((data) => {
            if (data.status == 'available') {
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
     add       Specify a directory or file to add that in config file.  so that when you run crawler next time it will also crawl.
     help      Print help message
     crawl     Crawl all directory which is mentioned in configuration 
     index     Index all data and content which has crawled in achoz search engine
     engine    Start web interface at port ${port} (change port in config)
     list      List directory which is specified in confir for normalization. the number will help to remove dir.
     remove    Remove  directory from config. eg achoz remove 3 
     version   Show version of achoz 

     Note: Default configuration is in ~/.achoz/config.json

    Examples:
    
    Add directory in config file. 
        you need to specify dirctories in config file so that crawler will crawl it. 
        to add directoy. use command 'add' 
        eg; suppose I want to add my ~/documents dir. then
        
        achoz add ~/documents 


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
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    listDir()
}
    

function listDir() {
    for (let i = 0; i < config.DirToIndex.length; i++ ) {
        console.log(i, config.DirToIndex[i])
    }
}

function removeDirConfig(index) {
    config.DirToIndex.splice(index, 1)
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    listDir()

}
