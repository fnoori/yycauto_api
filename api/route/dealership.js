const express = require('express');
const router = express.Router();
const multer = require('multer');

const DealershipController = require('../controller/dealership');

router.get('/:lazy_load/:per_page', DealershipController.getAllDealerships);

router.post('/this_be_da_admin/:key', DealershipController.createAdmin);

module.exports = router;