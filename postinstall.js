#!/usr/bin/env node

// const https = require('https')
const fs = require('fs');
const os = require('os')
const config = require("./config.json")
// const exec = require('child_process').execSync

// let user installs typesense.

// var url = 'https://dl.typesense.org/releases/0.21.0/typesense-server-0.21.0-linux-amd64.tar.gz'
// const path = '/tmp/server.tar.gz'

// https.get(url, (res) => {

//   const writeStream = fs.createWriteStream(path);
//   res.pipe(writeStream);

//   writeStream.on("finish", () => {
//     writeStream.close();
//     console.log("Download Completed");
//     config.TypesenseApi = createApiKey(40)
//     filename = "./config.json"
//     config.LocalDataDir = os.homedir + '/.achoz'
//     fs.writeFileSync(filename, JSON.stringify(config, null, 2));

//     exec('tar -xvf /tmp/server.tar.gz --directory=/tmp --overwrite')
//     fs.copyFileSync('/tmp/typesense-server', './bin/typesense-achoz')
//     fs.chmodSync("./bin/typesense-achoz", 0755) // TODO data integrity wip
//   });
// });







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

config.TypesenseApi = createApiKey(40)
filename = "./config.json"
config.LocalDataDir = os.homedir + '/.achoz'
fs.writeFileSync(filename, JSON.stringify(config, null, 2));

var achozdir = os.homedir + '/.achoz'

if (!fs.existsSync(achozdir)) {
    fs.mkdirSync(achozdir)
    fs.mkdirSync(achozdir + '/searchdb')
    fs.copyFileSync(appRoot + '/config.json', achozdir + '/config.json')
}