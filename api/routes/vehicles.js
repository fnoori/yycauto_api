const express = require('express');
const router = express.Router();
const multer = require('multer');

const VehiclesController = require('../controllers/vehicles');

router.get('/', VehiclesController.getAllVehicles);
router.get('/byId/:vehicleId', VehiclesController.getVehicleByID);
router.get('/byDealershipId/:dealershipId', VehiclesController.getVehicleByDealershipID);

module.exports = router;