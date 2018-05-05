const express = require('express');
const router = express.Router();
const multer = require('multer');

const DealershipsController = require('../controllers/dealerships');
router.get('/', DealershipsController.getAllDealerships);

module.exports = router;