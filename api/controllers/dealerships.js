const mongoose = require('mongoose');
const Dealership = require('../models/dealership');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');

const resMessages = require('../utils/resMessages');
const validations = require('../utils/validations');

const toExcludeFromFind = '-AccountCredentials.Password -__v -_id -AccountCredentials.AccessLevel';

exports.getAllDealerships = (req, res, next) => {
    const perPage = parseInt(req.params.perPage);
    const lazyLoad = parseInt(req.params.lazyLoad);

    Dealership.find()
        .select(toExcludeFromFind)
        .where('AccountCredentials.AccessLevel').nin([1])
        .skip(lazyLoad).limit(perPage).exec().then(docs => {
            res.status(200).json(docs);
        }).catch(err => {
            resMessages.resMessagesToReturn(500, err, res);
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
                resMessages.resMessagesToReturn(404, 'No dealership found with matching ID', res);
            }
        }).catch(err => {
            resMessages.logError(err);
            resMessages.resMessagesToReturn(500, err, res);
        });
}

exports.getDealershipByName = (req, res, next) => {
    const name = req.params.dealershipName;

    Dealership.find({ Name: name })
        .where('AccountCredentials.AccessLevel').nin([1])
        .select(toExcludeFromFind).exec().then(doc => {
            if (doc) {
                res.status(200).json({dealership: doc});
            } else {
                resMessages.resMessagesToReturn(404, resMessages.DEALERSHIP_NOT_FOUND_WITH_NAME, res);
            }
        }).catch(err => {
            resMessages.logError(err);
            resMessages.resMessagesToReturn(500, err, res);
        });
}

exports.signUpDealership = (req, res, next) => {
    Dealership.findById(req.userData.dealershipId)
        .select('AccountCredentials.AccessLevel')
        .exec().then(dealership => {
            // check access level of currently logged in user
            if (dealership.AccountCredentials.AccessLevel != 1) {
                return resMessages.resMessagesToReturn(403, 'Only admin users can create dealership accounts', res);
            }

            var creationOperations = req.body;
            var allErrors = {};

            allErrors = validations.validateDealershipCreation(creationOperations);

            if (Object.keys(allErrors).length > 0) {
                if (req.file) {
                    fs.unlink('uploads/tmp/logos/' + req.file.filename);
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
                    fs.unlink('uploads/tmp/logos/' + req.file.filename);
                    return resMessages.resMessagesToReturn(409, 'Account already exists for this dealership', res);
                } else {
                    bcrypt.hash(creationOperations['AccountCredentials.Password'], 10, (err, hash) => {
                        if (err) {
                            resMessages.logError(err);
                            return resMessages.resMessagesToReturn(500, err, res);
                        } else {
                            const newDealership = new Dealership({
                                _id: new mongoose.Types.ObjectId(),
                                'Name': creationOperations.Name,
                                'Phone': creationOperations.Phone,
                                'Address': creationOperations.Address,
                                'AccountCredentials': {
                                    'Email': creationOperations['AccountCredentials.Email'],
                                    'Password': hash,
                                    'AccessLevel': 2
                                }
                            });

                            newDealership.save().then(result => {
                                const dealershipFolder = result._id;

                                // must create dealership folder for dealerships photos
                                fs.mkdirSync('uploads/dealerships/' + dealershipFolder, (err) => {
                                    if (err) {
                                        resMessages.logError(err);
                                        return resMessages.resMessagesToReturn(500, err, res);
                                    }
                                });

                                // upload logo if provided
                                if (req.file) {
                                    fs.rename(req.file.path, 'uploads/dealerships/' + dealershipFolder + '/logo.' + req.file.filename, (err) => {
                                        if (err) {
                                            resMessages.logError(err);
                                            return resMessages.resMessagesToReturn(500, err, res);
                                        }
                                    });
                                }
                                
                                resMessages.resMessagesToReturn(201, 'Dealership account created', res);
                            }).catch(err => {
                                resMessages.logError(err);
                                return resMessages.resMessagesToReturn(500, err, res);
                            });
                        }
                    });
                }
            });
        }).catch(err => {
            resMessages.logError(err);
            resMessages.resMessagesToReturn(500, err, res);
        });
}

exports.signUpAdmin = (req, res, next) => {
    const adminCreationOperation = req.body;

    bcrypt.hash(adminCreationOperation.password, 10, (err, hash) => {
        if (err) {
            resMessages.logError(err);
            resMessages.resMessagesToReturn(500, err, res);
        } else {
            const newAdmin = new Dealership({
                _id: new mongoose.Types.ObjectId(),
                'Name': 'admin',
                'Phone': 'admin',
                'Address': 'admin',
                'AccountCredentials': {
                    'Email': adminCreationOperation.email,
                    'Password': hash,
                    'AccessLevel': 1
                }
            });

            newAdmin.save().then(result => {
                resMessages.resMessagesToReturn(201, resMessages.ADMIN_CREATED, res);
            }).catch(err => {
                resMessages.logError(err);
                resMessages.resMessagesToReturn(500, err, res);
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
                return resMessages.resMessagesToReturn(401, resMessages.AUTHENTICATION_FAIL, res);
            }

            bcrypt.compare(password, dealership[0].AccountCredentials.Password, (err, result) => {
                if (err) {
                    return resMessages.resMessagesToReturn(401, resMessages.AUTHENTICATION_FAIL, res);
                }

                if (result) {
                    const token = jwt.sign({
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

                return resMessages.resMessagesToReturn(401, resMessages.AUTHENTICATION_FAIL, res);
            });
        }).catch(err => {
            resMessages.logError(err);
            resMessages.resMessagesToReturn(500, err, res);
        });
}

exports.updateDealership = (req, res, next) => {
    var allErrors = {};
    var updateOperations = req.body;

    // invalid dealership updating
    if (req.userData.dealershipId != req.params.dealershipId) {
        if (req.file) {
            fs.unlink('uploads/tmp/logos/' + req.file.filename);
        }
        
        return resMessages.resMessagesToReturn(403,
            resMessages.DEALERSHIP_ID_TOKEN_NOT_MATCH, res);
    }

    allErrors = validations.validateDealershipUpdate(updateOperations);
    if (Object.keys(allErrors).length > 0) {
        if (req.file) {
            fs.unlink('uploads/tmp/logos/' + req.file.filename);
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
    Dealership.update({ _id: dealershipId }, { $set: updateOperations })
        .exec().then(result => {
            // if updating logo
            if (logoFile) {
                fs.rename(logoFile.path, 'uploads/dealerships/' + dealershipId + '/logo.' + logoFile.filename, (err) => {
                    if (err) {
                        resMessages.logError(err);
                        resMessages.resMessagesToReturn(500, err, res);
                        return;
                    }
                });
            }
            message: resMessages.DEALERSHIP_UPDATED,
            resMessages.resMessagesToReturn(200, successMessage, res);

        }).catch(err => {
            resMessages.logError(err);
            resMessages.resMessagesToReturn(500, err, res);
        });
}