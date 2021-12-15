#!/bin/bash
achoz_data_dir=$1

echo $achoz_data_dir

host=`cat ${achoz_data_dir}/config.json | jq -r .TypesenseHost`
api=`cat ${achoz_data_dir}/config.json | jq -r .TypesenseApi`
echo $api
echo $achoz_data_dir
cd /tmp
split -l 30 /tmp/IndexData.jsonln achoz

for i in `ls achoz*`
do 
      collection_name="test"
      curl "${host}/collections/${collection_name}/documents/import?action=create" \
            -X POST \
            -H "X-TYPESENSE-API-KEY: ${api}" \
            --data-binary @$i
done

rm -r /tmp/IndexData.jsonln
rm -r achoz*