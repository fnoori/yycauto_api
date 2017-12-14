'strict';

module.exports = function(app) {
    var users = require('../controllers/userController');

    var vehicles = require('../controllers/vehiclesController');
    var vehicleSearch = require('../controllers/vehicleSearchController');

    var userMiddleware = require('../middlewares/userMiddlewares');
    

    app.route('/getVehiclesDetails')
    .get(vehicles.getVehicleDetails);

    app.route('/vehicles/:adTier/:lazyLoadSkipBy')
    .get(vehicles.getVehicles);


    // Search routes
    app.route('/basicSearch/:searchQuery/:adTier/:lazyLoadSkipBy')
    .get(vehicleSearch.basicSearch);

    app.route('/advancedSearch/:make/:model/:type/:extColor/:intColor/' +
    ':fuelType/:transmission/:minPrice/:maxPrice/:tier/:lazyLoadSkipBy')
    .get(vehicleSearch.advancedSearch);


    // Login and account creation
    app.route('/createAccount/:username/:password/:dealershipId/:secretKey')
    .post(users.createAccount);

    app.route('/partnerLogin/:username/:password')
    .get(users.loginUser);

    
    // Past this, the routes can be accessed if proper authorization
    //app.use(userMiddleware.requireAuthentication);

    app.route('/getAllVehiclesForDealer/:sortBy/:sortDesc/:perPage/:currentPage/:searchQuery/:dealership')
    .get(vehicles.getVehiclesForDealer);

    app.route('/countDealershipVehicles/:dealership')
    .get(vehicles.dealershipInventoryCount);



    app.route('/testAuth')
    .get(vehicles.listAllVehicles_auth_test);
}