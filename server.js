var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var mongoose = require('mongoose');

var multer = require('multer');
var cors = require('cors');

var bodyParser = require('body-parser');

var vehicles = require('./api/models/vehiclesModel');
var vehicleDetails = require('./api/models/vehicleDetailsModel');
var users = require('./api/models/userModel');
var config = require('./config');



mongoose.Promise = global.Promise;
mongoose.connect(config.database, { useMongoClient: true });
app.set('secretKey', config.secret);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

var routes = require(config.routes);
routes(app);

app.listen(port);
console.log(config.successfullyStartedMsg + port);