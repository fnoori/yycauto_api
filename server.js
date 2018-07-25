require('dotenv').config({path:'./config.env'});

if (process.env.NODE_ENV === 'development') {
	//process.env.MONGODB_URI = 'mongodb://admin:pokik68elobuK@localhost:27017/yycauto?authSource=admin';
}

const http = require('http');
const app = require('./app');

const port = process.env.PORT || 3000;
const server = http.createServer(app);
server.listen(port);