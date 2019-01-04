const express = require('express');
const checkJWT = require('../middlewares/authentication');
const router = express.Router();

const userController = require('../controllers/user');

router.get('/get_users', userController.get_all_dealerships);
router.patch('/update_user', checkJWT, userController.update_dealership);

module.exports = router;
