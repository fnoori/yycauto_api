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

/*
storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: 'uploads',
  allowedFormats: ['jpg', 'png']
});
*/

storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, 'uploads');
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2000000 },
    fileFilter: fileFilter
});

router.get('/get_all_vehicles', vehicleController.get_all_vehicles);

router.post('/add_new_vehicle', checkJWT, upload.array('photos', 7), vehicleController.add_new_vehicle);

router.patch('/update_vehicle', checkJWT, upload.array('photos', 7), vehicleController.update_vehicle);

router.delete('/delete_vehicle', checkJWT, vehicleController.delete_vehicle);
router.delete('/delete_images', checkJWT, vehicleController.delete_images);

module.exports = router;
