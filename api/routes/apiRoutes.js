'strict';

module.exports = function(app) {
    var users = require('../controllers/userController');
    var vehicles = require('../controllers/vehiclesController');
    var userMiddleware = require('../middlewares/userMiddlewares')
    //app.use(userMiddleware.requireAuthentication);

    app.route('/vehicles')
    .get(vehicles.listAllVehicles);

    app.route('/createAccount/:username/:password/:dealershipId')
    .post(users.createAccount);

    app.route('/partnerLogin/:username/:password')
    .get(users.loginUser);

    app.use(userMiddleware.requireAuthentication)

    app.route('/getAllVehiclesForDealer')
    .get(vehicles.listAllVehicles_auth_test);
}