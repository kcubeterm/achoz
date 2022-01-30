const fs = require('fs')
const os = require('os')
const { MeiliSearch } = require('meilisearch')

appRoot = __dirname
exports.conf = function () {
    collectionName = "achozdoc"
    var defaultDataDir = appRoot
    var defaultConfig = `${defaultDataDir}/config.json`
    var userConfig = fs.existsSync(os.homedir + '/.achoz/config.json')
    configPath = userConfig ? os.homedir + '/.achoz/config.json' : defaultConfig
    achozDataDir = os.homedir + '/.achoz'
    config = require(configPath)
   
    typesenseHost = config.TypesenseHost
    typesenseApi = config.TypesenseApi
    port = config.AchozPort
    if (config.SearchEngine == 'meilisearch') {

        meiliclient = new MeiliSearch({
            host: meiliAddr,
            apikey: meiliApi
        })
    }
}


