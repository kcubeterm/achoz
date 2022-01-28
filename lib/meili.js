const fs = require("fs")
const fetch = require("node-fetch")
const readline = require('readline')
const conf = require(__dirname + "/../setconfig.js").conf
const linecounter = require(__dirname + "/line.js").linecounter
const { tmpdir } = require("os")
conf()


var coreIndexer = function (jsonlnfile) {
    console.log(jsonlnfile)
    let stream = fs.createReadStream(jsonlnfile)
    let rl = readline.createInterface({ input: stream })
    let documents = []
    let tempId = []
    rl.on('line', (line) => {

        let jsonline = JSON.parse(line)
        tempId.push(jsonline.id)
        documents.push(jsonline)
    })
    rl.on('close', () => {
        (async () => {
            const index = meiliclient.index(collectionName)
            let response = await index.addDocuments(documents)
            if (response.status !== 'failed') {
                var isIndexDB = fs.existsSync(achozDataDir + "/indexedDB.json")
                let indexedDb
                if (isIndexDB) {
                    indexedDb = JSON.parse(fs.readFileSync(achozDataDir + "/indexedDB.json"))
                    for ( let i; i < tempId.length; i++ ) {
                        indexedDb.arrayList.push(i)
                    }
                    fs.writeFileSync(achozDataDir + "/indexedDB.json", JSON.stringify(indexedDb))
                    
                } else {
                    let tempObject = {}
                    tempObject.arrayList = tempId
                    fs.writeFileSync(achozDataDir + "/indexedDB.json", JSON.stringify(tempObject))
                }
            }
        })()
    })
}
 exports.invokeIndexer = function() {
     let listExistedAjsonlnFile = fs.readdirSync('/tmp').filter(fn => fn.endsWith('.ajsonln'));
     listExistedAjsonlnFile.forEach(ajsonlnFile => coreIndexer('/tmp/' + ajsonlnFile))
     listExistedAjsonlnFile.forEach(ajsonlnFile => fs.unlinkSync('/tmp/' + ajsonlnFile))
}
