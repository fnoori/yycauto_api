const express = require('express');
const multer = require('multer');
const getFields = multer();
const router = express.Router();

const DealershipsController = require('../controllers/dealerships');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/initialUploadLoc/');
    },
    filename: function(req, file, cb){
        cb(null, file.originalname);
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

router.get('/', DealershipsController.getAllDealerships);
router.get('/byId/:dealershipId', DealershipsController.getDealershipByID);
router.post('/signUpDealership', upload.single('logo'), DealershipsController.signUpDealership);

module.exports = router;