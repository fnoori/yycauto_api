const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const validator = require('validator');

if (process.env.NODE_ENV === process.env.ENVIRONMENT_DEV ||
            process.env.NODE_ENV === process.env.ENVIRONMENT_DEV_CLOUDINARY) {
  let cors = require('cors')
  app.use(cors());
}

if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_AUDIENCE) {
  throw 'Make sure you have AUTH0_DOMAIN, and AUTH0_AUDIENCE in your .env file';
}

const userRoutes = require('./api/routes/user');
const vehicleRoutes = require('./api/routes/vehicle');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true })
.then().catch(err => {
	console.log('Mongo Connection Error', err);
});

// set file upload path
app.use('/uploads', express.static('uploads'));

// enable bodyparser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/users', userRoutes);
app.use('/vehicles', vehicleRoutes);

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
