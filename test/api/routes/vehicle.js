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

if (validator.equals(process.env.NODE_ENV, utils.DEVELOPMENT)) {
  storage = multer.diskStorage({
      destination: function(req, file, cb) {
        cb(null, 'uploads');
      },
      filename: function(req, file, cb) {
        cb(null, req.body.id + '-' + Date.now() + '.' + file.mimetype.split('/').pop());
      }
  });
} else if (validator.equals(process.env.NODE_ENV, utils.DEVELOPMENT_CLOUDINARY)) {
  storage = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: 'test/uploads',
    allowedFormats: ['jpg', 'png']
  });
}

fileFilter = (req, file, cb) => {
    if (file.mimetype == 'image/jpeg' ||
        file.mimetype == 'image/png') {
            cb(null, true);
        } else {
            cb(null, false);
        }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 2000000 },
    fileFilter: fileFilter
});

router.get('/get_all_vehicles/:skip/:limit', vehicleController.get_all_vehicles);
router.get('/get_vehicle_by_id', vehicleController.get_vehicle_by_id);
router.get('/search/:skip/:limit/:search_query', vehicleController.search_data);

router.post('/add_new_vehicle', checkJWT, upload.array('photos', 7), vehicleController.add_new_vehicle);

router.patch('/update_vehicle', checkJWT, upload.array('photos', 7), vehicleController.update_vehicle);

router.delete('/delete_vehicle', checkJWT, vehicleController.delete_vehicle);
router.delete('/delete_images', checkJWT, vehicleController.delete_images);

module.exports = router;
