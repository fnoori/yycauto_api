const express = require('express');
const router = express.Router();
const multer = require('multer');

const checkAuth = require('../middleware/checkAuth');
const VehicleController = require('../controller/vehicle');

// configure multer
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/tmp/');
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 3145728 },
  fileFilter: fileFilter
});

router.get('/get_all/:lazy_load/:per_page', VehicleController.getAllVehicles);

router.post('/add_new_vehicle/:dealership_id', checkAuth, upload.array('photos', 7), VehicleController.addNewVehicle);

module.exports = router;