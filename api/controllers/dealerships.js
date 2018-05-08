const mongoose = require('mongoose');
const Dealership = require('../models/dealership');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');

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

    Dealership.find({
        $or: [ 
            {'AccountCredentials.Email': req.body.email}, 
            {'Name':req.body.name} 
        ]
    })
    .exec()
    .then(dealership => {
        // dealership exists
        if (dealership.length >= 1) {
            // delete the uploaded logo, since it's a duplicate dealership
            fs.unlink('uploads/initialUploadLoc/' + req.file.originalname);

            return res.status(409).json({
                message: 'Account already exists for this dealership'
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
                        'AccountCredentials': {
                            'Email': email,
                            'Password': hash,
                            'Access Level': access
                        }
                    });

                    dealership.save().then(result => {
                        const dealershipFolder = name.split(' ').join('_') + '__' + result._id;

                        fs.mkdir('uploads/dealerships/' + dealershipFolder, (err) => {
                            if (err) {
                                errors.logError(err);
                            }                            
                        });
                        fs.rename(req.file.path, 'uploads/dealerships/' + dealershipFolder + '/logo.' + req.file.mimetype.split('/').pop(), (err) => {
                            if (err) {
                                errors.logError(err);
                            }
                        });

                        console.log(result);
                        res.status(201).json({
                            message: 'Dealership account created'
                        });
                    }).catch(err => {
                        errors.logError(err);
                        res.status(500).json({
                            error: err
                        });
                    });
                }
            });
        }
    });
}

exports.loginDealership = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    Dealership.find({ 'AccountCredentials.Email':  email })
    .exec()
    .then(dealership => {
        if (dealership.length < 1) {
            return res.status(401).json({
                message: 'Authentication failed'
            });
        }
        
        bcrypt.compare(password, dealership[0].AccountCredentials.Password, (err, result) => {
            if (err) {
                return res.status(401).json({
                    message: 'Authentication failed'
                });
            }

            if (result) {
                const token = jwt.sign({
                    email: dealership[0].AccountCredentials.Email,
                    dealershipId: dealership[0]._id
                },
                process.env.JWT_KEY,
                {
                    expiresIn: '1h'
                });

                return res.status(200).json({
                    message: 'Authentication sccessful',
                    token: token
                });
            }

            return res.status(401).json({
                message: 'Authentication failed'
            });
        });
    }).catch (err => {
        errors.logError(err);
        res.status(500).json({
            error: err
        });
    });
}

exports.updateDealership = (req, res, next) => {
    const dealershipId = req.params.dealershipId;
    var updateOperations = req.body;

    if (updateOperations['AccountCredentials.Password']) {
        bcrypt.hash(updateOperations['AccountCredentials.Password'], 10, (err, hash) => {
            if (err) {
                errors.logError(err);
                return res.status(500).json({
                    error: err
                });
            }
            updateOperations['AccountCredentials.Password'] = hash;
            updateDealershipHelper(updateOperations, dealershipId, res);
        });
    } else {
        updateDealershipHelper(updateOperations, dealershipId, res);
    }
}

// help function is needed to be able to extract the hashed password, if password is being changed
updateDealershipHelper = (updateOperations, dealershipId, res) => {
    console.log(updateOperations);
    console.log(dealershipId);

    Dealership.update({_id: dealershipId}, {$set: updateOperations})
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'Dealership successfully updated',
            request: {
                type: 'GET',
                url: 'http://localhost:3000/dealerships/byId/' + dealershipId
            }
        });
    }).catch(err => {
        errors.logError(err);
        res.status(500).json({
            error: err
        });
    });
}




