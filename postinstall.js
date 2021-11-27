#!/usr/bin/env node

const http = require('http')
const fs = require('fs');
const os = require('os')
const config = require("./config.json")

var url = 'http://localhost:8989/typesense-server'
const file = fs.createWriteStream('./bin/typesense-achoz');

const request = http.get(url, function (response) {
  response.pipe(file);
  fs.chmodSync("./bin/typesense-achoz", 0755)
  config.TypesenseApi = createApiKey(40)
  filename = "./config.json"
  config.LocalDataDir = os.homedir + '/.achoz'
  fs.writeFileSync(filename, JSON.stringify(config, null, 2));

});

function createApiKey(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
  }
  return result;
}

