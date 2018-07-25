require('dotenv').config({path:'./config.env'});
if (process.env.NODE_ENV === 'development') {
	process.env.MONGODB_URI = 'mongodb://admin:pokik68elobuK@localhost:27017/yycauto?authSource=admin';
}

var app = require('./app');
var port = process.env.PORT || 3000;

var server = app.listen(port, function() {
  console.log('Express server listening on port ' + port);
});