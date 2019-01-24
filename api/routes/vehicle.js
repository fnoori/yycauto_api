const express = require('express');
const validator = require('validator');
const checkJWT = require('../middlewares/authentication');
const router = express.Router();
var multer  = require('multer');
var cloudinary = require('cloudinary');
var cloudinaryStorage = require('multer-storage-cloudinary');
const vehicleController = require('../controllers/vehicle');
const utils = require('../utils/utils');

var storage;
var fileFilter;

storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: 'uploads',
  allowedFormats: ['jpg', 'png']
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2000000 },
    fileFilter: fileFilter
});

fileFilter = (req, file, cb) => {
  if (file.mimetype == 'image/jpeg' ||
  file.mimetype == 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

router.get('/get_all_vehicles', vehicleController.get_all_vehicles);
router.get('/get_vehicle_by_id', vehicleController.get_vehicle_by_id);

router.post('/add_new_vehicle', checkJWT, upload.array('photos', 7), vehicleController.add_new_vehicle);

router.patch('/update_vehicle', checkJWT, upload.array('photos', 7), vehicleController.update_vehicle);

router.delete('/delete_vehicle', checkJWT, vehicleController.delete_vehicle);
router.delete('/delete_images', checkJWT, vehicleController.delete_images);

module.exports = router;
