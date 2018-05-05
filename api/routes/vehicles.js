const express = require('express');
const router = express.Router();
const multer = require('multer');

const VehiclesController = require('../controllers/vehicles');

router.get('/', VehiclesController.getAllVehicles);

module.exports = router;