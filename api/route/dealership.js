const express = require('express');
const router = express.Router();
const multer = require('multer');

const checkAuth = require('../middleware/checkAuth');
const DealershipController = require('../controller/dealership');

router.post('/create_dealership/:key', checkAuth, DealershipController.createDealership);

router.post('/login', DealershipController.login);

router.post('/this_be_da_admin/:key', DealershipController.createAdmin);

router.get('/get_all/:lazy_load/:per_page', DealershipController.getAllDealerships);

module.exports = router;