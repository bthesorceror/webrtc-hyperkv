'use strict';

const path     = require('path');
const http     = require('http');
const ecstatic = require('ecstatic');

const port             = process.env.PORT || 8080;
const staticPath       = path.join(__dirname, 'static');
const staticMiddleware = ecstatic({ root: staticPath });

function onListen() {
  console.info(`Server now running on port ${port}`);
}

function onRequest(req, res) {
  console.info(`${req.method} ${req.url}`);
}

http
  .createServer(staticMiddleware)
  .on('request', onRequest)
  .listen(port, onListen);
