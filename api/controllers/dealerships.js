const mongoose = require('mongoose');
const Dealership = require('../models/dealership');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');

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
    const email = req.body.email;
    const password = req.body.password;
    const access = req.body.accessLevel;
    const name = req.body.name;
    const phone = req.body.phone;
    const address = req.body.address;

    console.log(req.body.email);

    return;

    Dealership.find({
        'AccountCredentials': {
            'Email': req.body.email
        }
    })
    .exec()
    .then(dealership => {
        // dealership exists
        if (dealership.length >= 1) {
            return res.status(409).json({
                message: 'Email already in use'
            });
        } else {
            bcrypt.hash(password, 10, (err, hash) => {
                if (err) {
                    errors.logError(err);
                    return res.status(500).json({
                        error: err
                    });
                } else {
                    const dealership = new Dealership({
                        _id: new mongoose.Types.ObjectId(),
                        'Name': name,
                        'Phone': phone,
                        'Address': address,
                        'Logo': req.file,
                        'AccountCredentials': {
                            'Email': email,
                            'Password': hash,
                            'Access Level': access
                        }
                    });

                    dealership.save().then(result => {
                        console.log(result);
                        res.status(201).json({
                            message: 'Dealership account created'
                        }).catch(err => {
                            errors.logError(err);
                            res.status(500).json({
                                error: err
                            });
                        });
                    });
                }
            });
        }
    });
}


