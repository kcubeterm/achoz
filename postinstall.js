#!/usr/bin/env node

const http = require('http')
const fs = require('fs');
const os = require('os')
const config = require("./config.json")
const targz = require('targz')

var url = 'https://dl.typesense.org/releases/0.21.0/typesense-server-0.21.0-linux-amd64.tar.gz'
const file = fs.createWriteStream('/tmp/server.tar.gz');

const request = http.get(url, function (response) {
  response.pipe(file);

  config.TypesenseApi = createApiKey(40)
  filename = "./config.json"
  config.LocalDataDir = os.homedir + '/.achoz'
  fs.writeFileSync(filename, JSON.stringify(config, null, 2));
  const targz = require('targz')
  targz.decompress({
    src: '/tmp/server.tar.gz',
    dest: '/tmp'
  }, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Done!");
      fs.copyFileSync('/tmp/typesense-server', './bin/typesense-achoz')
      fs.chmodSync("./bin/typesense-achoz", 0755) // data integrity wip
    }
  });

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

