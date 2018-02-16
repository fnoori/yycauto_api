'strict';

module.exports = function (app) {
    var users = require('../controllers/userController');
    var vehicles = require('../controllers/vehiclesController');
    var vehicleSearch = require('../controllers/vehicleSearchController');
    var userMiddleware = require('../middlewares/userMiddlewares');

    var multer = require('multer');
    const upload = multer({
        dest: './uploads'
    }).single('avatar');

    /*
        There routes are generally called when the page loads
    */
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
    app.route('/createAccount/:username/:password/:dealership/:secretKey')
        .post(users.createAccount);

    app.route('/partnerLogin/:username/:password')
        .get(users.loginUser);

    app.post('/profile', function (req, res) {
        upload(req, res, function(err) {
            if (err) {
                res.send(err);
            }

            res.end('File is uploaded')
        })
    });


    // Past this, the routes can be accessed if proper authorization
    app.use(userMiddleware.requireAuthentication);

    app.route('/getAllVehiclesForDealer/:sortBy/:sortDesc/:perPage/:currentPage/:searchQuery/:dealership')
        .get(vehicles.getVehiclesForDealer);

    app.route('/countDealershipVehicles/:dealership')
        .get(vehicles.dealershipInventoryCount);
}