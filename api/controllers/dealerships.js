const mongoose = require('mongoose');
const Dealership = require('../models/dealership');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const errors = require('../utils/error');

exports.getAllDealerships = (req, res, next) => {
    Dealership.find()
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            dealerships: docs.map(doc => {
                return {
                    content: doc,
                    vehicles: {
                        type: 'GET',
                        url: 'http://localhost:3000/vehicles/byDealershipId/0/4/' + doc._id
                    }
                }
            })
        };
        res.status(200).json(response);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
}

exports.getDealershipByID = (req, res, next) => {
    const ID = req.params.dealershipId;
    
    Dealership.findById(ID)
    .exec()
    .then(doc => {
        if (doc) {
            res.status(200).json({
                dealership: doc
            });
        } else {
            res.status(404).json({
                message: 'No dealership found with matching ID'
            });
        }
    })
    .catch(err => {
        errors.logError(err);
        res.status(500).json({
            error: err
        });
    });
}

exports.signUpDealership = (req, res, next) => {
    Dealership.find({
        'Account Credentials': {
            'Email': req.body.email
        }
    })
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