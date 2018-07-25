var jwt = require('express-jwt');
var jwks = require('jwks-rsa');

var jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: "https://yyc-automotives.auth0.com/.well-known/jwks.json"
  }),
  audience: 'https://yyc-automotives-auth0-api',
  issuer: "https://yyc-automotives.auth0.com/",
  algorithms: ['RS256']
});

module.exports = jwtCheck;