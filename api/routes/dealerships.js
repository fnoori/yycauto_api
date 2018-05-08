const express = require('express');
const multer = require('multer');
const getFields = multer();
const router = express.Router();

const DealershipsController = require('../controllers/dealerships');



router.get('/', DealershipsController.getAllDealerships);
router.get('/byId/:dealershipId', DealershipsController.getDealershipByID);
router.post('/signUpDealership', getFields.any(), DealershipsController.signUpDealership);

module.exports = router;