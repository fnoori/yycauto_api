const express = require('express');
const router = express.Router();
const multer = require('multer');

const checkAuth = require('../middleware/checkAuth');
const VehicleController = require('../controller/vehicle');

router.get('/get_all/:lazy_load/:per_page', VehicleController.getAllVehicles);

router.post('/add_new_vehicle/:dealership_id', checkAuth, VehicleController.addNewVehicle);

module.exports = router;