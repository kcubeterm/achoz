const fs = require('fs');
const path = require('path');
const uniqueName = require(__dirname + '/unique-name').uniqueName
const officeParser = require('officeparser');
const {
    convert
} = require('html-to-text')
const os = require('os')
const conf = require(__dirname + "/../setconfig").conf