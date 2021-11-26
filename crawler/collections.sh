#!/bin/bash 
achoz_data_dir=$1
host=`cat ${achoz_data_dir}/config.json | jq -r .TypesenseHost`
api=`cat ${achoz_data_dir}/config.json | jq -r .TypesenseApi`

collection_name="test"
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
