const fs = require('fs')
const os = require('os')

appRoot = __dirname
exports.conf = function () {
    var defaultdatadir = appRoot
    var defaultConfig = `${defaultdatadir}/config.json`
    var userConfig = fs.existsSync(os.homedir + '/.achoz/config.json')
    configPath = userConfig ? os.homedir + '/.achoz/config.json' : defaultConfig
    achozDataDir = os.homedir + '/.achoz'
    config = require(configPath)
    
    TypesenseHost = config.TypesenseHost
    Typesense_api = config.TypesenseApi
    Port = config.AchozPort
}


