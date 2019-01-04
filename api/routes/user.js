const express = require('express');
const checkJWT = require('../middlewares/authentication');
const router = express.Router();

const userController = require('../controllers/user');

router.get('/get_users', userController.get_all_dealerships);

module.exports = router;
