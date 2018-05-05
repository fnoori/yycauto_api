const express = require('express');
const router = express.Router();
const multer = require('multer');

const VehiclesController = require('../controllers/vehicles');

router.get('/:lazyLoad/:perPage', VehiclesController.getAllVehicles);
router.get('/byId/:vehicleId', VehiclesController.getVehicleByID);
router.get('/byDealershipId/:lazyLoad/:perPage/:dealershipId', VehiclesController.getVehicleByDealershipID);

module.exports = router;