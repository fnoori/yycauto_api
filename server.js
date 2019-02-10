require('dotenv').config({path:'./config.env'});
require('./config.js').configureEnvironment();
const utils = require('./api/utils/utils');
var http;
var app;
var port;
var server;

/*
  this will need to be changed for release
  from 'http' to 'https'
*/
if (process.env.NODE_ENV === utils.PRODUCTION) {

  http = require('http');
  app = require('./app');
  port = process.env.PORT || 3000;
  server = http.createServer(app);

} else if (process.env.NODE_ENV === utils.DEVELOPMENT ||
            process.env.NODE_ENV === utils.DEVELOPMENT_CLOUDINARY) {

  http = require('http');
  app = require('./app');
  port = process.env.PORT || 3000;
  server = http.createServer(app);

}

server.listen(port);
console.log(`ENVIRONMENT: ${process.env.NODE_ENV} -- Listening on port: ${port}`);
