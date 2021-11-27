#!/usr/bin/env node

const http = require('http'); // or 'https' for https:// URLs
const fs = require('fs');

var url = 'http://localhost:8989/typesense-server'
const file = fs.createWriteStream("./bin/typesense-achoz");
try {
  
  const request = http.get(url, function(response) {
    response.pipe(file);
    fs.chmodSync("./bin/typesense-achoz", 0755)
    
  });
} catch (error) {
  console.warn(error)
  
}