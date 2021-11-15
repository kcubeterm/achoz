#!/bin/bash
#input=lol.jsonln
input="@/home/kcubeterm/project/achoz/crawler/IndexData.jsonln"
host=`cat ~/project/achoz/config.json | jq -r .TypesenseHost`
api=`cat ~/project/achoz/config.json | jq -r .TypesenseApi`


 
 collection_name="test3"
 curl "${host}/collections/${collection_name}/documents/import?action=create" \
       -X POST \
       -H "X-TYPESENSE-API-KEY: ${api}" \
        --data-binary $input
