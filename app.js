var express = require('express');
var app = express();
var db = require('./db');
const bodyParser = require('body-parser');
var cors = require('cors');

app.use(cors());

var VehicleController = require('./vehicle/VehicleController');

// set file upload path
app.use('/uploads', express.static('uploads'));

// enable bodyparser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// routes
app.use('/vehicles', VehicleController);

// error handling
app.use((req, res, next) => {
	const error = new Error('Route Not Found');
	error.status = 404;
	next(error);
});

app.use((error, req, res, next) => {
	res.status(error.status || 500);
	res.json({
		error: {
			message: error.message
		}
	});
});

module.exports = app;