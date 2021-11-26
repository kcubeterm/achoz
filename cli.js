#!/usr/bin/env node

const appRoot = require('app-root-path')
const exec = require('child_process').exec


let crawlerAndindexer = new Promise((resolve, reject) => {
    exec(`node ${appRoot}/crawler/crawler.js`, (err, stdout, stderr) => {
        if (err) {
            console.warn(err)
        }
        resolve();
    }).stdout.on('data', function (data) {
        console.log(data);
    });
    
})

crawlerAndindexer.then(() => {
    console.log('Indexing documents')
    exec(`bash ${appRoot}/crawler/indexer.sh`, (err, stdout, stderr) => {
        if (err) {
            console.warn(err)
        }
    }).stdout.on('data', function (data) {
        console.log(data);
    });

}).then(() => {
    exec(`node ${appRoot}/server.js`).stdout.on('data', function (data) {
        console.log(data);
    })
})

