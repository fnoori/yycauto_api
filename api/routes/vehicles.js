const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const multer = require('multer');

const VehiclesController = require('../controllers/vehicles');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/tmp/vehicles/');
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + '.' + file.mimetype.split('/').pop());
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/png') {
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

router.get('/:lazyLoad/:perPage', VehiclesController.getAllVehicles);
router.get('/byId/:vehicleId', VehiclesController.getVehicleByID);
router.get('/byDealershipId/:lazyLoad/:perPage/:dealershipId', checkAuth, VehiclesController.getVehicleByDealershipID);
router.get('/byDealershipName/:lazyLoad/:perPage/:dealershipName', VehiclesController.getVehicleByDealershipName);

router.post('/addNewVehicle/:dealershipId', checkAuth, upload.array('vehicleImages'), VehiclesController.addNewVehicle);

router.patch('/update/:dealershipId/:vehicleId', checkAuth, upload.array('vehicleImages'), VehiclesController.updateVehicle);

module.exports = router;