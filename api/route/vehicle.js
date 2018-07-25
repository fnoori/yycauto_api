const express = require('express');
const router = express.Router();
const multer = require('multer');

const VehicleController = require('../controller/vehicle');

router.get('/:lazy_load/:per_page', VehicleController.getAllVehicles);

module.exports = router;