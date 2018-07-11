const jwt = require('express-jwt');
const jwtAuthz = require('express-jwt-authz');
const jwksRsa = require('jwks-rsa');

// Authentication middleware. When used, the
// Access Token must exist and be verified against
// the Auth0 JSON Web Key Set
module.exports = jwt({
  // Dynamically provide a signing key
  // based on the kid in the header and 
  // the signing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: process.env.JWKSURI
  }),

  // Validate the audience and the issuer.
  audience: process.env.AUDIENCE,
  issuer: process.env.ISSUER,
  algorithms: ['RS256']
})




























/*const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
	try {
		const token = req.headers.authorization.split(' ')[1];

		const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.userData = decoded;
		next();
	} catch (error) {
		return res.status(401).json({
			message: 'Authentication failed'
		});
	}
};*/