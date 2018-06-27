const express = require('express');
const multer = require('multer');
const checkAuth = require('../middleware/checkAuth');
const getFields = multer();
const router = express.Router();

const DealershipsController = require('../controllers/dealership');

// Configure storage for multer
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/tmp/logos/');
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + '.' + file.mimetype.split('/').pop());
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

router.post('/createDealershipAccount', checkAuth, upload.single('logo'));



module.exports = router;
