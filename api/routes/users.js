const express = require('express');
const router = express.Router();
const UsersController = require('../controllers/users');

router.post('/signup', UsersController.signUpUser);

module.exports = router;