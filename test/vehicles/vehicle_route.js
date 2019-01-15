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

  // Configure storage for multer
  storage = multer.diskStorage({
      destination: function(req, file, cb) {
        cb(null, 'uploads');
      },
      filename: function(req, file, cb){
        cb(null, req.body.id + '-' + Date.now() + '.' + file.mimetype.split('/').pop());
      }
  });
  fileFilter = (req, file, cb) => {
      if (file.mimetype == 'image/jpeg' ||
          file.mimetype == 'image/png') {
              cb(null, true);
          } else {
              cb(null, false);
          }
  };

} else if (validator.equals(process.env.NODE_ENV, utils.DEVELOPMENT_CLOUDINARY)) {

  storage = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: 'folder-name',
    allowedFormats: ['jpg', 'png']
  });

}


const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 },
    fileFilter: fileFilter
});

router.get('/get_all_vehicles', vehicleController.get_all_vehicles);

router.post('/add_new_vehicle', checkJWT, vehicleController.add_new_vehicle);
router.post('/add_vehicle_photos', checkJWT, upload.array('photos', 7), vehicleController.add_vehicle_photos);

router.patch('/update_vehicle', checkJWT, vehicleController.update_vehicle);

module.exports = router;
