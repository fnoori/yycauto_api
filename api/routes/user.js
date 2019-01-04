const express = require('express');
const checkJWT = require('../middlewares/authentication');
const router = express.Router();

const userController = require('../controllers/user');

router.get('/get_users', userController.get_all_dealerships);
router.get('/get_dealership_by_id', userController.get_dealership_by_id);

router.patch('/update_user', checkJWT, userController.update_dealership);

module.exports = router;
