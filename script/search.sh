#!/bin/bash
#it is only for test purpose
#input=lol.jsonln
input="@/home/kcubeterm/project/achoz/crawler/IndexData.jsonln"
host=`cat ~/project/achoz/config.json | jq -r .TypesenseHost`
api=`cat ~/project/achoz/config.json | jq -r .TypesenseApi`


 curl "${host}/collections/test2/documents/search?q=is&query_by=content&page=1&highlight_fields=content&exclude_fields=content&snippet_threshold=10&highlight_affix_num_tokens=10" -H "X-TYPESENSE-API-KEY: ${api}"
 
 