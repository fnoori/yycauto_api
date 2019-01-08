const express = require('express');
const checkJWT = require('../middlewares/authentication');
const router = express.Router();

const vehicleController = require('../controllers/vehicle');

router.get('/get_all_vehicles', vehicleController.get_all_vehicles);

router.post('/add_new_vehicle', checkJWT, vehicleController.add_new_vehicle);

module.exports = router;
