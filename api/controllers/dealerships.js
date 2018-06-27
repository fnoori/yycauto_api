const mongoose = require('mongoose');
const Dealership = require('../models/dealership');
const Vehicle = require('../models/vehicle');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');

const resMessages = require('../utils/resMessages');
const validations = require('../utils/validations');
const utilities = require('../utils/utility');

const googleBucketReqs = require('../../bucket/googleBucketReqs');
const googleBucket = require('../../bucket/googleBucket');

const rootTmpLogoDir = 'uploads/tmp/logos/';

const toExcludeFromFind = '-AccountCredentials.Password -__v -_id -AccountCredentials.AccessLevel';

exports.getAllDealerships = (req, res, next) => {
    const perPage = parseInt(req.params.perPage);
    const lazyLoad = parseInt(req.params.lazyLoad);

    Dealership.find()
        .select(toExcludeFromFind)
        .where('AccountCredentials.AccessLevel').nin([1])
        .skip(lazyLoad).limit(perPage).exec().then(docs => {
            res.status(200).json(docs);
        }).catch(dealershipFind => {
            resMessages.logError(dealershipFind);
            resMessages.returnError(500, dealershipFind, 'find()', res);
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
                return resMessages.resMessagesToReturn(404, resMessages.DEALERSHIP_NOT_FOUND_WITH_ID, res);
            }
        }).catch(dealershipFindById => {
            resMessages.logError(dealershipFindById);
            resMessages.returnError(500, dealershipFindById, 'findById()', res);
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
                return resMessages.resMessagesToReturn(404, resMessages.DEALERSHIP_NOT_FOUND_WITH_NAME, res);
            }
        }).catch(dealershipFind => {
            resMessages.logError(dealershipFind);
            resMessages.returnError(500, dealershipFind, 'find()', res);
        });
}

exports.createDealershipAccount = (req, res, next) => {
    Dealership.findById(req.userData.dealershipId)
        .select('AccountCredentials.AccessLevel')
        .exec().then(dealership => {
            // check access level of currently logged in user
            if (dealership.AccountCredentials.AccessLevel != 1) {
                return resMessages.resMessagesToReturn(403, resMessages.ADMIN_ONLY_CREATE_DEALERSHIP, res);
            }

            var creationOperations = req.body;
            var allErrors = {};

            allErrors = validations.validateDealershipCreation(creationOperations);

            if (Object.keys(allErrors).length > 0) {
                if (req.file) {
                    fs.unlink(rootTmpLogoDir + req.file.filename, fsUnlinkErr => {
                        if (fsUnlinkErr) {
                            resMessages.logError(fsUnlinkErr);
                            resMessages.returnError(500, fsUnlinkErr, 'fs.unlink()', res);
                        }
                    });
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
                    fs.unlink(rootTmpLogoDir + req.file.filename, fsUnlinkErr => {
                        if (fsUnlinkErr) {
                            resMessages.logError(fsUnlinkErr);
                            resMessages.returnError(500, fsUnlinkErr, 'fs.unlink()', res);
                        }
                    });
                    resMessages.nonCriticalError(resMessages.DEALERHSHIP_ALREADY_EXISTS, res);
                } else {
                    bcrypt.hash(creationOperations['AccountCredentials.Password'], 10, (hashErr, hash) => {
                        if (hashErr) {
                            resMessages.logError(hashErr);
                            resMessages.returnError(500, hashErr, 'bcrypt.hash()', res);
                        } else {
                            const newDealership = new Dealership({
                                _id: new mongoose.Types.ObjectId(),
                                'Name': creationOperations.Name,
                                'Phone': creationOperations.Phone,
                                'Address': creationOperations.Address,
                                'Logo': 'logo.' + req.file.mimetype.split('/').pop(),
                                'AccountCredentials': {
                                    'Email': creationOperations['AccountCredentials.Email'],
                                    'Password': hash,
                                    'AccessLevel': 2
                                }
                            });

                            newDealership.save().then(result => {
                                const dealershipFolder = result.Name.split(' ').join('_');

                                // upload logo if provided
                                if (req.file) {
                                    const logoDest = '/dealerships/' + dealershipFolder + '/logo.' + req.file.mimetype.split('/').pop();
                                    googleBucket.uploadFile(rootTmpLogoDir + req.file.filename, logoDest);
                                }

                                return resMessages.resMessagesToReturn(201, resMessages.DEALERSHIP_CREATED, res);
                            }).catch(saveErr => {
                                resMessages.logError(saveErr);
                                resMessages.returnError(500, saveErr, 'save()', res);
                            });
                        }
                    });
                }
            }).catch(dealershipFindErr => {
                resMessages.logError(dealershipFindErr);
                resMessages.returnError(500, dealershipFindErr, 'find()', res);
            });
        }).catch(dealershipFindByIdErr => {
            resMessages.logError(dealershipFindByIdErr);
            resMessages.returnError(500, dealershipFindByIdErr, 'findById()', res);
        });
}

exports.signUpAdmin = (req, res, next) => {
    const adminCreationOperation = req.body;

    bcrypt.hash(adminCreationOperation.password, 10, (bcryptHashErr, hash) => {
        if (bcryptHashErr) {
            resMessages.logError(bcryptHashErr);
            resMessages.returnError(500, bcryptHashErr, 'bcrypt.hash()', res);
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
                return resMessages.resMessagesToReturn(201, resMessages.ADMIN_CREATED, res);
            }).catch(newAdminSaveErr => {
                resMessages.logError(newAdminSaveErr);
                resMessages.returnError(500, newAdminSaveErr, 'save()', res);
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
                        dealershipId: dealership[0]._id,
                        dealershipName: dealership[0].Name
                    },
                        process.env.JWT_KEY,
                        {
                            expiresIn: '1h'
                        });

                    return res.status(200).json({
                        message: resMessages.AUTHENTICATION_SUCCESS,
                        token: token
                    });
                }

                return resMessages.resMessagesToReturn(401, resMessages.AUTHENTICATION_FAIL, res);
            });
        }).catch(dealershipFindErr => {
            resMessages.logError(dealershipFindErr);
            resMessages.returnError(500, dealershipFindErr, 'find()', res);
        });
}

exports.updateDealership = (req, res, next) => {
    var allErrors = {};
    var updateOperations = req.body;

    // invalid dealership updating
    if (req.userData.dealershipId != req.params.dealershipId) {
        if (req.file) {
            fs.unlink(rootTmpLogoDir + req.file.filename, fsUnlinkErr => {
                if (fsUnlinkErr) {
                    resMessages.logError(fsUnlinkErr);
                    resMessages.returnError(500, fsUnlinkErr, 'fs.unlink()', res);
                }
            });
        }

        return resMessages.resMessagesToReturn(403, resMessages.DEALERSHIP_ID_TOKEN_NOT_MATCH, res);
    }

    allErrors = validations.validateDealershipUpdate(updateOperations);
    if (Object.keys(allErrors).length > 0) {
        if (req.file) {
            fs.unlink(rootTmpLogoDir + req.file.filename, fsUnlinkErr => {
                if (fsUnlinkErr) {
                    resMessages.logError(fsUnlinkErr);
                    resMessages.returnError(500, fsUnlinkErr, 'fs.unlink()', res);
                }
            });
        }
        return resMessages.resMessagesToReturn(400, allErrors, res);
    }


    Dealership.findById(req.params.dealershipId)
        .select('AccountCredentials.Password -_id Name Logo')
        .exec().then(dealership => {
            if (dealership.length < 1) {
                return resMessages.resMessagesToReturn(401, resMessages.DEALERSHIP_NOT_FOUND_WITH_ID, res);
            }

            const dealershipFolder = dealership.Name.split(' ').join('_');
            // upload logo if provided
            if (req.file) {
                googleBucketReqs.storage
        		.bucket(googleBucketReqs.bucketName)
        		.file('dealerships/' + dealership.Name.split(' ').join('_') + '/' + dealership.Logo).delete()
        		.then(() => {}).catch(bucketDeleteFileErr => {
                    resMessages.logError(bucketDeleteFileErr);
                    resMessages.returnError(500, bucketDeleteFileErr, 'bucket.delete()', res);
        		});

                updateOperations['Logo'] = 'logo.' + req.file.mimetype.split('/').pop();
            }

            if (updateOperations['OldPassword'] &&
                updateOperations['AccountCredentials.Password']) {

                // validate
                bcrypt.compare(updateOperations.OldPassword, dealership.AccountCredentials.Password, (err, result) => {
                    if (err) {
                        return resMessages.resMessagesToReturn(401, resMessages.OLD_PASSWORD_INCORRECT, res);
                    }
                    if (result) {
                        // update
                        bcrypt.hash(updateOperations['AccountCredentials.Password'], 10, (bcryptHashErr, hash) => {
                            if (bcryptHashErr) {
                                resMessages.logError(bcryptHashErr);
                                resMessages.returnError(500, bcryptHashErr, 'bcrypt.hash()', res);
                            }

                            updateOperations['AccountCredentials.Password'] = hash;
                            updateDealershipHelper(updateOperations, req.params.dealershipId, req.file, dealershipFolder, res);
                        });
                    } else {
                        return resMessages.resMessagesToReturn(401, resMessages.OLD_PASSWORD_INCORRECT, res);
                    }
                });
            }

            // No password change, we still need to call the update helper for any other changes
            updateDealershipHelper(updateOperations, req.params.dealershipId, req.file, dealershipFolder, res);
        }).catch(dealershipFindByIdErr => {
            if (req.file) {
                fs.unlink(rootTmpLogoDir + req.file.filename, fsUnlinkErr => {
                    if (fsUnlinkErr) {
                        resMessages.logError(fsUnlinkErr);
                        resMessages.returnError(500, fsUnlinkErr, 'fs.unlink()', res);
                    }
                });
            }
            resMessages.logError(dealershipFindByIdErr);
            resMessages.returnError(500, dealershipFindByIdErr, 'findById()', res);
        });
}

updateDealershipHelper = (updateOperations, dealershipId, logoFile, dealershipFolder, res) => {
    var updateData = {};

    if (updateOperations['AccountCredentials.Email'] != null) {
        updateData['AccountCredentials.Email'] = updateOperations['AccountCredentials.Email'];
    }
    if (updateOperations['AccountCredentials.Password'] != null) {
        updateData['AccountCredentials.Password'] = updateOperations['AccountCredentials.Password'];
    }
    if (updateOperations['Phone'] != null) {
        updateData['Phone'] = updateOperations['Phone'];
    }
    if (updateOperations['Address'] != null) {
        updateData['Address'] = updateOperations['Address'];
    }
    if (updateOperations['Logo'] != null) {
        updateData['Logo'] = updateOperations['Logo'];
    }

    Dealership.update({ _id: dealershipId }, { $set: updateData })
        .exec().then(result => {
            // if updating logo
            if (logoFile) {
                const logoDest = '/dealerships/' + dealershipFolder + '/logo.' + logoFile.mimetype.split('/').pop();
                googleBucket.uploadFile(rootTmpLogoDir + logoFile.filename, logoDest);
            }
            return resMessages.resMessagesToReturn(200, resMessages.DEALERSHIP_UPDATED, res);

        }).catch(dealershipUpdateErr => {
            resMessages.logError(dealershipUpdateErr);
            resMessages.returnError(500, dealershipUpdateErr, 'update()', res);
        });
}

exports.deleteDealershipById = (req, res, next) => {
    const dealershipId = req.params.dealershipId;
    const dealershipName = req.params.dealershipName;

    Dealership.findById(req.userData.dealershipId)
        .select('AccountCredentials.AccessLevel')
        .exec().then(dealership => {

            // check access level of currently logged in user
            if (dealership.AccountCredentials.AccessLevel != 1 &&
                req.userData.dealershipId != dealershipId) {
                return resMessages.resMessagesToReturn(403, resMessages.CANNOT_DELETE_DEALERSHIP, res);
            }

            const prefix = 'dealerships/' + dealershipName.split(' ').join('_') + '/';

            googleBucketReqs.storage
            .bucket(googleBucketReqs.bucketName)
            .deleteFiles({prefix: prefix})
            .then(() => {
                Dealership.remove({_id: dealershipId})
                .exec().then(result => {

                    // Delete all the dealerships vehicles too
                    Vehicle.remove({'Dealership._id': dealershipId})
                    .exec().then(dealershipVehiclesRemoved => {}).catch(dealershipVehicleRemovedErr => {
                        resMessages.logError(dealershipVehicleRemovedErr);
                        resMessages.returnError(500, dealershipVehicleRemovedErr, 'update()', res);
                    });

                }).catch(dealershipRemoveErr => {
                    resMessages.logError(dealershipRemoveErr);
                    resMessages.returnError(500, dealershipRemoveErr, 'update()', res);
                });
            }).catch (bucketDeleteFilesErr => {
                resMessages.logError(bucketDeleteFilesErr);
                resMessages.returnError(500, bucketDeleteFilesErr, 'update()', res);
            });
            return resMessages.resMessagesToReturn(200, resMessages.DEALERSHIP_DELETED, res);
        }).catch(dealershipFindByIdErr => {
            resMessages.logError(dealershipFindByIdErr);
            resMessages.returnError(500, dealershipFindByIdErr, 'update()', res);
        });
}
