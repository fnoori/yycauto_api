const express = require('express');
const checkJWT = require('../middlewares/authentication');
const router = express.Router();
const validator = require('validator');
const userController = require('../controllers/user');
const utils = require('../utils/utils');
var multer  = require('multer');
var cloudinary = require('cloudinary');
var cloudinaryStorage = require('multer-storage-cloudinary');

var storage;
var fileFilter;

if (validator.equals(process.env.NODE_ENV, utils.DEVELOPMENT)) {
  storage = multer.diskStorage({
      destination: function(req, file, cb) {
        cb(null, 'uploads');
      },
      filename: function(req, file, cb){
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

router.get('/get_all_dealerships', userController.get_all_dealerships);
router.get('/get_dealership_by_id', userController.get_dealership_by_id);

router.patch('/update_dealership', checkJWT, upload.single('logo'), userController.update_dealership);
router.patch('/update_dealership_hours', checkJWT, userController.update_dealership_hours);

module.exports = router;
