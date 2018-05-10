const mongoose = require('mongoose');
const Dealership = require('../models/dealership');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');

const resMessages = require('../utils/resMessages');
const validations = require('../utils/validations');

const toExcludeFromFind = '-AccountCredentials.Password -__v -_id';

exports.getAllDealerships = (req, res, next) => {
    Dealership.find()
    .select(toExcludeFromFind).exec().then(docs => {
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
    .select(toExcludeFromFind).exec().then(doc => {
        if (doc) {
            res.status(200).json({
                dealership: doc
            });
        } else {
            res.status(404).json({
                message: 'No dealership found with matching ID'
            });
        }
    }).catch(err => {
        resMessages.logError(err);
        res.status(500).json({
            error: err
        });
    });
}

exports.getDealershipByName = (req, res, next) => {
    const name = req.params.dealershipName;

    Dealership.find({ Name: name })
    .select(toExcludeFromFind).exec().then(doc => {
        if (doc) {
            res.status(200).json({
                dealership: doc
            });
        } else {
            resMessages.resMessagesToReturn(404, resMessages.DEALERSHIP_NOT_FOUND_WITH_NAME, res);
        }
    }).catch(err => {
        resMessages.logError(err);
        resMessages.resMessagesToReturn(500, err, res);
    });
}

exports.signUpDealership = (req, res, next) => {
    var creationOperations = req.body;
    var allErrors = {};

    allErrors = validations.validateDealershipCreation(creationOperations);

    if (Object.keys(allErrors).length > 0) {
        if (req.file) {
            fs.unlink('uploads/tmp/' + req.file.originalname);
        }
        return resMessages.resMessagesToReturn(400, allErrors, res);
    }

    Dealership.find({
        $or: [
            { 'AccountCredentials.Email': creationOperations['AccountCredentials.Email'] },
            { 'Name': creationOperations.Name }
        ]
    }).exec().then(dealership => {
        // dealership exists
        if (dealership.length >= 1) {
            // delete the uploaded logo, since it's a duplicate dealership
            fs.unlink('uploads/tmp/' + req.file.originalname);

            return res.status(409).json({
                message: 'Account already exists for this dealership'
            });
        } else {
            bcrypt.hash(creationOperations['AccountCredentials.Password'], 10, (err, hash) => {
                if (err) {
                    resMessages.logError(err);
                    return res.status(500).json({
                        error: err
                    });
                } else {
                    const newDealership = new Dealership({
                        _id: new mongoose.Types.ObjectId(),
                        'Name': creationOperations.Name,
                        'Phone': creationOperations.Phone,
                        'Address': creationOperations.Address,
                        'AccountCredentials': {
                            'Email': creationOperations['AccountCredentials.Email'],
                            'Password': hash,
                            'AccessLevel': creationOperations['AccountCredentials.AccessLevel']
                        }
                    });

                    //console.log(newDealership)

                    newDealership.save().then(result => {
                        const dealershipFolder = result._id;

                        // must create dealership folder for dealerships photos
                        fs.mkdirSync('uploads/dealerships/' + dealershipFolder, (err) => {
                            if (err) {
                                resMessages.logError(err);
                            }
                        });

                        // upload logo if provided
                        if (req.file) {
                            fs.rename(req.file.path, 'uploads/dealerships/' + dealershipFolder + '/logo.' + req.file.mimetype.split('/').pop(), (err) => {
                                if (err) {
                                    resMessages.logError(err);
                                    return;
                                }
                            });
                        }

                        res.status(201).json({
                            message: 'Dealership account created'
                        });
                    }).catch(err => {
                        resMessages.logError(err);
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

    Dealership.find({ 'AccountCredentials.Email': email })
    .exec().then(dealership => {
        if (dealership.length < 1) {
            return res.status(401).json({
                message: resMessages.AUTHENTICATION_FAIL
            });
        }

        bcrypt.compare(password, dealership[0].AccountCredentials.Password, (err, result) => {
            if (err) {
                return res.status(401).json({
                    message: resMessages.AUTHENTICATION_FAIL
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
                message: resMessages.AUTHENTICATION_FAIL
            });
        });
    }).catch(err => {
        resMessages.logError(err);
        res.status(500).json({
            error: err
        });
    });
}

exports.updateDealership = (req, res, next) => {
    var allErrors = {};
    var updateOperations = req.body;

    // invalid dealership updating
    if (req.userData.dealershipId != req.params.dealershipId) {
        return resMessages.resMessagesToReturn(403,
            resMessages.DEALERSHIP_ID_TOKEN_NOT_MATCH, res);
    }

    allErrors = validations.validateDealershipUpdate(updateOperations);
    if (Object.keys(allErrors).length > 0) {
        if (req.file) {
            fs.unlink('uploads/tmp/' + req.file.originalname);
        }
        return resMessages.resMessagesToReturn(400, allErrors, res);
    }

    // validate old password (if changing password)
    if (updateOperations['OldPassword'] &&
        updateOperations['AccountCredentials.Password']) {

        Dealership.findById(req.userData.dealershipId)
        .select('AccountCredentials.Password -_id')
        .exec().then(dealership => {
            if (dealership.length < 1) {
                return resMessages.resMessagesToReturn(401, resMessages.DEALERSHIP_NOT_FOUND_WITH_ID, res);
            }
            
            // validate
            bcrypt.compare(updateOperations.OldPassword, dealership.AccountCredentials.Password, (compareError, result) => {
                if (compareError) {
                    return resMessages.resMessagesToReturn(401, resMessages.OLD_PASSWORD_INCORRECT, res);
                }
                if (result) {
                    // update
                    bcrypt.hash(updateOperations['AccountCredentials.Password'], 10, (err, hash) => {
                        if (err) {
                            resMessages.logError(err);
                            return resMessages.resMessagesToReturn(500, err, res);
                        }
                        updateOperations['AccountCredentials.Password'] = hash;

                        updateDealershipHelper(updateOperations, req.userData.dealershipId, req.file, res);
                    });
                } else {
                    return resMessages.resMessagesToReturn(401, resMessages.OLD_PASSWORD_INCORRECT, res);
                }
            });
        }).catch(err => {
            resMessages.logError(err);
            resMessages.resMessagesToReturn(500, err, res);
        });
    } else {
        updateDealershipHelper(updateOperations, req.userData.dealershipId, req.file, res);
    }
}

updateDealershipHelper = (updateOperations, dealershipId, logoFile, res) => {
    Dealership.update({ _id: dealershipId }, {$set: updateOperations })
    .exec().then(result => {
        // if updating logo
        if (logoFile) {
            fs.rename(logoFile.path, 'uploads/dealerships/' + dealershipId + '/logo.' + logoFile.mimetype.split('/').pop(), (err) => {
                if (err) {
                    resMessages.logError(err);
                    resMessages.resMessagesToReturn(500, err, res);
                    return;
                }
            });
        }

        const successMessage = {
            message: resMessages.DEALERSHIP_UPDATED,
            request: {
                type: 'GET',
                url: 'http://localhost:3000/dealerships/byId/' + dealershipId
            }
        };
        resMessages.resMessagesToReturn(200, successMessage, res);

    }).catch(err => {
        resMessages.logError(err);
        resMessages.resMessagesToReturn(500, err, res);
    });
}