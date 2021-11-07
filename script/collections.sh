

TYPESENSE_API_KEY=4u5YKY5LFlM58GVmdnt8NckPxmjBPlKsbC4Qkzu5go4fvGhZ # sample api key

curl "http://localhost:8108/collections" \
       -X POST \
       -H "Content-Type: application/json" \
       -H "X-TYPESENSE-API-KEY: ${TYPESENSE_API_KEY}" \
       -d '{
         "name": "files",
         "fields": [
           {"name": "name", "type": "string" },
           {"name": "abspath", "type": "string" },
           {"name": "atime", "type": "int32"},
           {"name": "mtime", "type": "string"},
           {"name": "type", "type": "string", "facet": true }
         ],
         "default_sorting_field": "atime"
       }'
