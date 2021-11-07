#!/bin/bash
input=/home/kcubeterm/project/achoz/crawler/IndexData.jsonln
export TYPESENSE_HOST='http://localhost:8108'
export TYPESENSE_API_KEY=4u5YKY5LFlM58GVmdnt8NckPxmjBPlKsbC4Qkzu5go4fvGhZ
while IFS= read -r line
do
  curl "${TYPESENSE_HOST}/collections/files/documents" \
        -X POST \
        -H "Content-Type: application/json" \
        -H "X-TYPESENSE-API-KEY: ${TYPESENSE_API_KEY}" \
        -d "$line"
done < "$input"