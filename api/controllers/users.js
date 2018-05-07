const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Dealership = require('../models/dealership');

const errors = require('../utils/error');

exports.signUpUser = (req, res, next) => {
    User.find({email: req.body.email})
    .exec()
    .then(user => {
        // user exists
        if (user.length >= 1) {
            return res.status(409).json({
                message: 'Email already in use'
            });
        } else {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                errors.logError(err);
            });

            user.save().then(result => {
                console.log(result);
                res.status(201).json({
                    message: 'Account created'
                });
            }).catch(err => {
                errors.logError(err);
            });
        }
    });
}