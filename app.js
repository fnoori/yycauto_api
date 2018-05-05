const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// routes
const vehicleRoutes = require('./api/routes/vehicles');
const dealershipRoutes = require('./api/routes/dealerships');

mongoose.connect('mongodb+srv://admin:' + process.env.MONGO_ATLAS_PW + '@yycauto-e7yg5.mongodb.net/yycauto');

// setup morgan error detailing
app.use(morgan('dev'));

// set file upload path
app.use('/uploads', express.static('uploads'));

// enable bodyparser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// configure CORS
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Header',
				'Origin, X-Requested-With, Content-Type, Accept, Athorization');

	if (req.method === 'OPTIONS') {
		res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
		return res.status(200).json({});
	}

	next();
});

// handle routes
app.use('/vehicles', vehicleRoutes);
app.use('/dealerships', dealershipRoutes);

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