const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_AUDIENCE) {
  throw 'Make sure you have AUTH0_DOMAIN, and AUTH0_AUDIENCE in your .env file';
}

const userRoutes = require('./api/routes/user');

mongoose.connect(process.env.MONGO_URI_LOCAL, { useNewUrlParser: true })
.then().catch(err => {
	console.log('Mongo Connection Error', err);
});

// enable bodyparser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/users', userRoutes);

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
