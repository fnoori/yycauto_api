const express = require('express');
const checkJWT = require('../middlewares/authentication');
const router = express.Router();

const vehicleController = require('../controllers/vehicle');

router.get('/get_vehicles', vehicleController.get_all_vehicles);

module.exports = router;
