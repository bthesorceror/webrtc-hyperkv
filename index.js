'use strict';

const path = require('path');
const http = require('http');
const ecstatic = require('ecstatic');

http.createServer(ecstatic({
  root: path.join(__dirname, 'static')
})).listen(process.env.PORT || 8080)
