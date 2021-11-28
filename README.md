# achoz

like a web search, but for your personal files.

more details at http://ahoxus.org/achoz

## Installation 

As of now achoz supports linux 64 bit architecure only.

you need to install typesense server as well https://typesense.org/downloads/

```
git clone --depth=1 https://github.com/kcubeterm/achoz 
cd achoz
npm install -g .
```

## Configure directory

Now need to configure directory where you keep documents and files so that crawler could index it into search engine.

Add directory in config.json, config.json will be at `~/.achoz/config.json`


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


