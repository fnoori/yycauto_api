'strict';

module.exports = function(app) {
    var vehicles = require('../controllers/vehiclesController');

    app.route('/vehicles')
    .get(vehicles.listAllVehicles)
}