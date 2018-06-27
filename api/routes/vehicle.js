const express = require('express');
const multer = require('multer');
const checkAuth = require('../middleware/checkAuth');
const getFields = multer();
const router = express.Router();

const vehicleController = require('../controllers/vehicle');
