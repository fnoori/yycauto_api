const express = require('express');
const checkJWT = require('../middlewares/authentication');
const router = express.Router();
const userController = require('../controllers/user');
var multer  = require('multer');
var cloudinary = require('cloudinary');
var cloudinaryStorage = require('multer-storage-cloudinary');

var storage;
var fileFilter;

storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: 'test/uploads',
  allowedFormats: ['jpg', 'png']
});

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
