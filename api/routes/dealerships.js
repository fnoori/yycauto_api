const express = require('express');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');
const getFields = multer();
const router = express.Router();

const DealershipsController = require('../controllers/dealerships');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/tmp/logos/');
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

router.get('/:lazyLoad/:perPage', DealershipsController.getAllDealerships);
router.get('/byId/:dealershipId', checkAuth, DealershipsController.getDealershipByID);
router.get('/byName/:dealershipName', DealershipsController.getDealershipByName);

router.post('/signUp', checkAuth, upload.single('logo'), DealershipsController.signUpDealership);
router.post('/admin/signup', DealershipsController.signUpAdmin);
router.post('/login', DealershipsController.loginDealership);

router.patch('/update/:dealershipId', checkAuth, upload.single('logo'), DealershipsController.updateDealership);

router.delete('/delete/:dealershipId/:dealershipName', checkAuth, DealershipsController.deleteDealershipById);

module.exports = router;
