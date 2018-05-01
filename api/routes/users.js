const express = require('express');
const router = express.Router();

const UsersController = require('../controllers/users');

router.post('/signup', UsersController.sign_up_user);
router.post('/login', UsersController.login_usre);
router.delete('/:userId', UsersController.delete_user);

module.exports = router;