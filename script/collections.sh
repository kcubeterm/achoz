#!/bin/bash 
host=`cat ~/project/achoz/config.json | jq -r .TypesenseHost`
api=`cat ~/project/achoz/config.json | jq -r .TypesenseApi`
echo $host $api
collection_name="test4"
curl "${host}/collections" \
       -X POST \
       -H "Content-Type: application/json" \
       -H "X-TYPESENSE-API-KEY: ${api}" \
       -d '{
         "name": "test",
         "fields": [
           {"name": "name", "type": "string" },
           {"name": "abspath", "type": "string" },
           {"name": "atime", "type": "string"},
           {"name": "ctime", "type": "string"},
           {"name": "mtimeMs", "type": "float"},
           {"name": "type", "type": "string", "facet": true },
           {"name": "content", "type": "string", "optional": true}

         ],
         "default_sorting_field": "mtimeMs"
       }'
