#!/bin/bash
achoz_data_dir=$1
input="@${achoz_data_dir}/IndexData.jsonln"
host=`cat ${achoz_data_dir}/config.json | jq -r .TypesenseHost`
api=`cat ${achoz_data_dir}/config.json | jq -r .TypesenseApi`

split -l 30 ${achoz_data_dir}/IndexData.jsonln
for i in `ls x*`
do 
      collection_name="test"
      curl "${host}/collections/${collection_name}/documents/import?action=create" \
            -X POST \
            -H "X-TYPESENSE-API-KEY: ${api}" \
            --data-binary @$i
done