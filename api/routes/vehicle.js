const express = require('express');
const checkJWT = require('../middlewares/authentication');
const router = express.Router();
var multer  = require('multer');
const vehicleController = require('../controllers/vehicle');

// Configure storage for multer
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, 'uploads');
    },
    filename: function(req, file, cb){
      cb(null, req.body.id + '-' + Date.now() + '.' + file.mimetype.split('/').pop());
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype == 'image/jpeg' ||
        file.mimetype == 'image/png') {
            cb(null, true);
        } else {
            cb(null, false);
        }
};
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
