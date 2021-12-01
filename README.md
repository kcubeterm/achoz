# achoz

like a web search, but for your personal files.

more details at http://ahoxus.org/achoz

## Installation 

As of now achoz supports linux 64 bit architecure only.

you need to install typesense server https://typesense.org/downloads/

poppler-utils,jq and antiword.

```
npm install -g achoz
```
use sudo if you are not root.
## Configure directory

Now need to configure directory where you keep documents and files so that crawler could index it into search engine.

Add directory in config.json, config.json will be at `~/.achoz/config.json` 

run  `achoz` it will create config file if not already exist.


config.json looks like 
```
{
  "DirToIndex": [
    "~/project/achoz/crawler/sample", "~/videos", "~/documents"
  ],
  "TypesenseHost": "http://localhost:8909",
  "TypesenseApi": "DKRhOb8Eoh2LUgGJkjZfJUu9La7BVJYrVtJa5J07",
  "AchozPort": 8080,
  "LocalDataDir": "/root/.achoz"
}
```

you need to change this part only
```
"DirToIndex": [
    "~/project/achoz/crawler/sample", "~/videos", "~/documents"
    ]
 ```

Once you done with all.Start achoz heart by `achoz engine` then open another tab and fire `achoz crawl` it will start crawling and once it crawled.
then fire `achoz index ` and it will  index all documents that have been crawled. 

Now you are ready to go once fire `achoz start` 

browse and search docs at http://localhost:8080 

