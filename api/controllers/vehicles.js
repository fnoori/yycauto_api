const mongoose = require('mongoose');
const Vehicle = require('../models/vehicle');
const Dealership = require('../models/dealership');
const resMessages = require('../utils/resMessages');
const validations = require('../utils/validations');
const fs = require('fs');

const omitFromFind = '-__v -Dealership._id';

exports.getAllVehicles = (req, res, next) => {
    const lazyLoad = parseInt(req.params.lazyLoad);
    const perPage = parseInt(req.params.perPage);

    Vehicle.find()
    .skip(lazyLoad).limit(perPage)
    .select(omitFromFind)
    .exec().then(docs => {
        res.status(200).json(docs);
    })
    .catch(err => {
        resMessages.logError(err);
        resMessages.resMessagesToReturn(500, err, res);
    });
}

exports.getVehicleByID = (req, res, next) => {
    const ID = req.params.vehicleId;

    Vehicle.findById(ID).exec().then(doc => {
        if (doc) {
            res.status(200).json({
                vehicle: doc
            });
        } else {
            resMessages.resMessagesToReturn(404, 'No vehicle found with matching ID', res);
        }
    }).catch(err =>  {
        resMessages.logError(err);
        resMessages.resMessagesToReturn(500, err, res);
    });
}

exports.getVehicleByDealershipID = (req, res, next) => {
    const dealershipID = req.params.dealershipId;
    const perPage = parseInt(req.params.perPage);
    const lazyLoad = parseInt(req.params.lazyLoad);
    
    Vehicle.find({'Dealership._id': dealershipID})
    .select(omitFromFind)
    .skip(lazyLoad).limit(perPage).exec().then(doc => {
        if (doc) {
            res.status(200).json(doc);
        } else {
            resMessages.resMessagesToReturn(404, 'No dealership found with matching ID', res);
        }
    }).catch(err => {
        resMessages.logError(err);
        resMessages.resMessagesToReturn(500, err, res);
    });
}

exports.getVehicleByDealershipName = (req, res, next) => {
    const dealershipName = req.params.dealershipName;
    const perPage = parseInt(req.params.perPage);
    const lazyLoad = parseInt(req.params.lazyLoad);

    Vehicle.find({'Dealership.Name': dealershipName})
    .skip(lazyLoad).limit(perPage)
    .select(omitFromFind)
    .exec().then(doc => {
        if (doc) {
            res.status(200).json(doc);
        } else {
            resMessages.resMessagesToReturn(404, 'No dealership found with matching ID', res);
        }
    }).catch(err => {
        resMessages.logError(err);
        resMessages.resMessagesToReturn(500, err, res);
    });
}

exports.addNewVehicle = (req, res, next) => {
    var allErrors = {};
    var creationOperatinos = req.body;

    // ensure dealership is adding to their own inventory
    if (req.userData.dealershipId != req.params.dealershipId) {
        if (req.files) {
            for (var i = 0; i < req.files.length; i++) {
                fs.unlink('uploads/tmp/vehicles/' + req.files[i].filename);
            }
        }
        
        return resMessages.resMessagesToReturn(403,
            resMessages.DEALERSHIP_ID_TOKEN_NOT_MATCH, res);
    }

    if (req.files.length <= 0) {
        return resMessages.resMessagesToReturn(400, 'Must include photos of vehicle', res);
    }

    allErrors = validations.validateVehicleData(creationOperatinos);

    if (Object.keys(allErrors).length > 0) {
        if (req.files) {
            for (var i = 0; i < req.files.length; i++) {
                fs.unlink('uploads/tmp/vehicles/' + req.files[i].filename);
            }
        }

        return resMessages.resMessagesToReturn(400, allErrors, res);
    }

    const vehicleInfo = req.body; 

    // first check if the dealership exists
    Dealership.findById(req.userData.dealershipId)
    .select('AccountCredentials.Email Name Phone Address _id').exec()
    .then(dealershipResult => {
        if (dealershipResult) {
            const vehicleData = vehicleInfo;
            delete vehicleData.DealershipId;

            vehicleData['_id'] = new mongoose.Types.ObjectId(),
            vehicleData['Dealership.Email'] = dealershipResult.AccountCredentials.Email;
            vehicleData['Dealership.Name'] = dealershipResult.Name;
            vehicleData['Dealership.Address'] = dealershipResult.Address;
            vehicleData['Dealership.Phone'] = dealershipResult.Phone;
            vehicleData['Dealership._id'] = req.userData.dealershipId;

            const newVehicle = new Vehicle(vehicleData);

            // save data
            newVehicle.save().then(saveResult => {

                // check if the 'vehicles' directory exists for that dealership, if not, make new directory
                if (!fs.existsSync('uploads/dealerships/' + req.userData.dealershipName.split(' ').join('_') + '/vehicles/')) {
                    fs.mkdirSync('uploads/dealerships/' + req.userData.dealershipName.split(' ').join('_') + '/vehicles/', (createVehicleDirErr) => {
                        if (createVehicleDirErr) {
                            resMessages.logError(createVehicleDirErr);
                            return resMessages.resMessagesToReturn(500, createVehicleDirErr, res);
                        }
                    });
                }

                // create directory for the specific vehicle (where the images will be stored)
                fs.mkdirSync('uploads/dealerships/' + req.userData.dealershipName.split(' ').join('_') + '/vehicles/' + saveResult._id, (createDirErr) => {
                    if (createDirErr) {
                        resMessages.logError(createDirErr);
                        return resMessages.resMessagesToReturn(500, createDirErr, res);
                    }
                });

                // move the vehicle images from the tmp directory to the dealership directory
                for (var i = 0; i < req.files.length; i++) {
                    fs.rename(req.files[i].path, 'uploads/dealerships/' + 
                                req.userData.dealershipName.split(' ').join('_') + '/vehicles/' + 
                                saveResult._id + '/' + req.files[i].filename, (renameErr) => {
                        if (renameErr) {
                            resMessages.logError(renameErr);
                            return resMessages.resMessagesToReturn(500, renameErr, res);
                        }
                    });
                }

                resMessages.resMessagesToReturn(201, 'Vehicle created', res);
            }).catch(saveError => {
                resMessages.logError(saveError);
                resMessages.resMessagesToReturn(500, saveError, res);
            })

        } else {
            resMessages.resMessagesToReturn(404, 'No dealership found with matching ID', res);
        }
    }).catch(err => {
        resMessages.logError(err);
        resMessages.resMessagesToReturn(500, err, res);
    });
}

exports.updateVehicle = (req, res, next) => {
    var allErrors = {};
    var updateOperations = req.body;

    // ensure dealership is updating to their own inventory
    if (req.userData.dealershipId != req.params.dealershipId) {
        if (req.files) {
            for (var i = 0; i < req.files.length; i++) {
                fs.unlink('uploads/tmp/vehicles/' + req.files[i].filename);
            }
        }
        
        return resMessages.resMessagesToReturn(403,
            resMessages.DEALERSHIP_ID_TOKEN_NOT_MATCH, res);
    }

    allErrors = validations.validateVehicleData(updateOperations);

    // check if there is already a maximum number files for this vehicle
    if (req.files) {
        var result = fs.readdirSync('uploads/dealerships/' + req.userData.dealershipName.split(' ').join('_') + 
        '/vehicles/' + req.params.vehicleId);
        if (result.length >= 7) {
            allErrors['Max Files'] = 'Maximum of 7 files reached, please delete one and try uploading again';
            for (var i = 0; i < req.files.length; i++) {
                fs.unlink('uploads/tmp/vehicles/' + req.files[i].filename);
            }
        }
    }

    if (Object.keys(allErrors).length > 0) {
        if (req.files) {
            for (var i = 0; i < req.files.length; i++) {
                fs.unlink('uploads/tmp/vehicles/' + req.files[i].filename);
            }
        }

        return resMessages.resMessagesToReturn(400, allErrors, res);
    }

    const vehicleInfo = req.body; 

    // since the validation is already done earlier, simply pass the update operations to $set
    Vehicle.update({_id: req.params.vehicleId}, {$set: updateOperations})
    .exec().then(result => {
        if (req.files) {
            for (var i = 0; i < req.files.length; i++) {
                fs.rename(req.files[i].path, 'uploads/dealerships/' + 
                            req.userData.dealershipName.split(' ').join('_') + '/vehicles/' + 
                            req.params.vehicleId + '/' + req.files[i].filename, (renameErr) => {
                    if (renameErr) {
                        resMessages.logError(renameErr);
                        return resMessages.resMessagesToReturn(500, renameErr, res);
                    }
                });
            }
        }
        resMessages.resMessagesToReturn(200, resMessages.VEHICLE_UPDATED, res);
    }).catch(err => {
        resMessages.logError(err);
        resMessages.resMessagesToReturn(500, err, res);
    });
}