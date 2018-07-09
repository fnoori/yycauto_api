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
                resMessages.resMessagesToReturn(404, resMessages.DEALERSHIP_NOT_FOUND_WITH_ID, res);
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
                resMessages.resMessagesToReturn(404, resMessages.DEALERSHIP_NOT_FOUND_WITH_NAME, res);
            }
        }).catch(dealershipFind => {
            resMessages.logError(dealershipFind);
            resMessages.returnError(500, dealershipFind, 'find()', res);
        });
}

exports.signUpDealership = (req, res, next) => {
    
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

        resMessages.resMessagesToReturn(403, resMessages.DEALERSHIP_ID_TOKEN_NOT_MATCH, res);
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
        resMessages.resMessagesToReturn(400, allErrors, res);
    }


    Dealership.findById(req.userData.dealershipId)
        .select('AccountCredentials.Password -_id Name Logo')
        .exec().then(dealership => {
            if (dealership.length < 1) {
                resMessages.resMessagesToReturn(401, resMessages.DEALERSHIP_NOT_FOUND_WITH_ID, res);
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
                bcrypt.compare(updateOperations.OldPassword, dealership.AccountCredentials.Password, (compareError, result) => {
                    if (compareError) {
                        resMessages.resMessagesToReturn(401, resMessages.OLD_PASSWORD_INCORRECT, res);
                    }
                    if (result) {
                        // update
                        bcrypt.hash(updateOperations['AccountCredentials.Password'], 10, (bcryptHashErr, hash) => {
                            if (bcryptHashErr) {
                                resMessages.logError(bcryptHashErr);
                                resMessages.returnError(500, bcryptHashErr, 'bcrypt.hash()', res);
                            }

                            updateOperations['AccountCredentials.Password'] = hash;
                        });
                    } else {
                        resMessages.resMessagesToReturn(401, resMessages.OLD_PASSWORD_INCORRECT, res);
                    }
                });
            }

            updateDealershipHelper(updateOperations, req.userData.dealershipId, req.userData.dealershipName, req.file, dealershipFolder, res);
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

updateDealershipHelper = (updateOperations, dealershipId, dealershipName, logoFile, dealershipFolder, res) => {
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
            resMessages.resMessagesToReturn(200, resMessages.DEALERSHIP_UPDATED, res);

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
                resMessages.resMessagesToReturn(403, resMessages.CANNOT_DELETE_DEALERSHIP, res);
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
            resMessages.resMessagesToReturn(200, resMessages.DEALERSHIP_DELETED, res);
        }).catch(dealershipFindByIdErr => {
            resMessages.logError(dealershipFindByIdErr);
            resMessages.returnError(500, dealershipFindByIdErr, 'update()', res);
        });
}
