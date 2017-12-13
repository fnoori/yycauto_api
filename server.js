var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var mongoose = require('mongoose');

var vehicles = require('./api/models/vehiclesModel');
var users = require('./api/models/userModel');
var bodyParser = require('body-parser');

var config = require('./config');

mongoose.Promise = global.Promise;
mongoose.connect(config.database, { useMongoClient: true });
app.set('secretKey', config.secret);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require(config.routes);
routes(app);

app.listen(port);
console.log(config.successfullyStartedMsg + port);