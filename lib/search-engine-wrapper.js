const fetch = require('node-fetch')
const conf = require(__dirname + '/../setconfig.js').conf
const typesense = require(__dirname + '/./typesense.js')
const meili = require(__dirname + '/./meili.js')
conf()

class meilisearch {
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
    indexer() {
        meili.invokeIndexer()
    }
}


module.exports.meilisearch = meilisearch
