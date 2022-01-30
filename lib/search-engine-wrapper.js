const fetch = require('node-fetch')
const conf = require(__dirname + '/../setconfig.js').conf
const typesense = require(__dirname + '/./typesense.js')
const meili = require(__dirname + '/./meili.js')
conf()

class meilisearchWrapper {
    constructor() {

    }
    // this method will normalize the result into a common json that will be common with both search engine.
    /* format will look like following
    
    { totalHits: 22,
        page: 3,
  query: 'book',
  processingTime: 106,
  hits: [
      { id: '',
       name: '',
       abspath: '',
       content:'',
       type: 'pdf' },
     { id: '',
       name: '',
       abspath: '',
       content:'',
       type: 'pdf' }
    ]
    }
    */
    normaliseSearch(query, page) {
        return new Promise((resolve, reject) => {

            this.search(query, page).then(res => {
                let finalResult = {}
                finalResult.totalHits = res.nbHits
                finalResult.page = page
                finalResult.query = res.query
                finalResult.processingTime = res.processingTimeMs
                finalResult.hits = []

                for (let i = 0; i < res.hits.length; i++) {
                    finalResult.hits.push(res.hits[i]._formatted)
                }
                resolve(finalResult)
            }).catch(err => {
                reject(err)
            })
        })
    }
    search(query, page) {
        return new Promise((resolve, reject) => {

            let offsetValue = 0
            let limitValue = 10
            if (page > 1) {
                offsetValue = (page * limitValue) - limitValue
            }

            let options = {
                offset: offsetValue,
                limit: limitValue,
                attributesToHighlight: ['content', 'name'],
                attributesToRetrieve: ['id', 'name', 'abspath', 'type'],
                attributesToCrop: ['content'],
                cropLength: 50
            }
            meiliclient.index(collectionName).search(query, options).then(response => {
                resolve(response)
            }).catch(err => {
                reject(err)
            })
        })
    }
}

class typesenseWrapper {
    constructor() {

    }
    normaliseSearch(query, page) {
        return new Promise((resolve, reject) => {

            let options = `query_by=name,content&exclude_fields=content&highlight_fields=content&\
            page=${page}&highlight_affix_num_tokens=10&highlight_start_tag=<b>&highlight_end_tag=</b>`

            typesense.search(query, options).then(res => {
                let finalResult = {}
                finalResult.totalHits = res.found
                finalResult.page = res.page
                finalResult.query = query
                finalResult.processingTime = res.search_time_ms
                finalResult.hits = []
                for (let i = 0; i < res.hits.length; i++) {
                    let tempObject = {}
                    let doc = res.hits[i].document
                    tempObject.id = doc.id
                    tempObject.name = doc.name
                    tempObject.abspath = doc.abspath
                    tempObject.content = res.hits[i].highlights['snippet']
                    finalResult.hits.push(tempObject)
                }
                resolve(finalResult)
            }).catch(err => {
                reject(err)
            })
        })
    }
}

class searchEngine {
    constructor() {

    }
    search(query, page) {
        if (config.SearchEngine == 'meilisearch') {
            return new Promise((resolve, reject) => {
                new meilisearchWrapper().normaliseSearch(query, page).then(res => {
                    resolve(res)
                }).catch(err => {
                    reject(err)
                })
            })
        } else if (config.SearchEngine = 'typesenese') {
            return new Promise((resolve, reject) => {
                new typesenseWrapper().normaliseSearch(query, page).then(res => {
                    resolve(res)
                }).catch(err => {
                    reject(err)
                })

            })
        } else {
            return 1
        }
    }

    indexer() {
        if (config.SearchEngine == 'meilisearch') {
            meili.invokeIndexer()
        } else if (config.SearchEngine == 'typesense') {
                // wip 
        }
    }
    collectionCreator() {
        // meilisearch creates collection automaticlly so this is specific to typesense. 
        typesense.createCollection()
    }
    deletedoc(id) {
        if (config.SearchEngine == 'meilisearch') {
            meiliclient.index(collectionName).deleteDocument(id).then(res => console.log(res)) // TODO attention needed

        } else if (config.SearchEngine == 'typesense') {
            typesense.deletedoc(id) // TODO attention needed. 
        } 
    }
}

module.exports.searchEngine = searchEngine
