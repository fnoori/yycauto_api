const express = require('express');
const checkJWT = require('../middlewares/authentication');
const router = express.Router();

const userController = require('../controllers/user');

router.patch('/get_users', checkJWT, userController.update_dealership);

module.exports = router;
