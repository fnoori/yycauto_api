'strict';

module.exports = function(app) {
    var users = require('../controllers/userController');
    var vehicles = require('../controllers/vehiclesController');

    app.route('/vehicles')
    .get(vehicles.listAllVehicles);

    app.route('/createAccount/:username/:password/:dealershipId')
    .post(users.createAccount)
    .get(users.loginUser);
}