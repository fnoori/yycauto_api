const express = require('express');
const router = express.Router();
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

const VehiclesController = require('../controllers/vehicles');

const storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, './uploads/');
	},
	filename: function(req, file, cb) {
		cb(null, new Date().toISOString() + file.originalname);
	}
});
const fileFilter = (req, file, cb) => {
	if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
		cb(null, true);
	} else {
		cb(null, false);
	}
}
const upload = multer({
	storage: storage, 
	limits: {
		fileSize: 1024 * 1024 * 5
	},
	fileFilter: fileFilter
});



router.get('/', VehiclesController.get_vehicles);
router.get('/:vehicleId', VehiclesController.get_vehicles_by_id);
router.post('/', checkAuth, upload.single('vehicleImage'), VehiclesController.add_vehicle);
router.patch('/:vehicleId', checkAuth, VehiclesController.update_vehicle);
router.delete('/:vehicleId', checkAuth, VehiclesController.delete_vehicle);


module.exports = router;