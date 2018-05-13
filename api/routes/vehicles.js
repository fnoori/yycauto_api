const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const multer = require('multer');

const VehiclesController = require('../controllers/vehicles');

router.get('/:lazyLoad/:perPage', VehiclesController.getAllVehicles);
router.get('/byId/:vehicleId', VehiclesController.getVehicleByID);
router.get('/byDealershipId/:lazyLoad/:perPage/:dealershipId', VehiclesController.getVehicleByDealershipID);
router.get('/byDealershipName/:lazyLoad/:perPage/:dealershipName', VehiclesController.getVehicleByDealershipName);

module.exports = router;