const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const vehicleRoute = require('./api/route/vehicle');
const dealershipRoute = require('./api/route/dealership');

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
.then().catch(err => {
	console.log('Mongo Connection Error', err);
});

app.use(morgan('dev'));

// set file upload path
app.use('/uploads', express.static('uploads'));

// enable bodyparser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(cors());

// handle routes
app.use('/vehicles', vehicleRoute);
app.use('/dealerships', dealershipRoute);

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