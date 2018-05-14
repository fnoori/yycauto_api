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
        const response = {
            count: docs.length,
            vehicles: docs
        };
        res.status(200).json(response);
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
            const response = {
                count: doc.length,
                'Dealership Vehicles': doc
            };
            res.status(200).json(response);
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

    allErrors = validations.validateVehicleCreation(creationOperatinos);

    return;



    // ensure dealership is adding to their own inventory
    if (req.userData.dealershipId != req.params.dealershipId) {
        return resMessages.resMessagesToReturn(403,
            resMessages.DEALERSHIP_ID_TOKEN_NOT_MATCH, res);
    }

    if (req.files.length <= 0) {
        return resMessages.resMessagesToReturn(400, 'Must include photos of vehicle', res);
    }

    const vehicleInfo = req.body; 

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

            newVehicle.save().then(saveResult => {

                if (!fs.existsSync('uploads/dealerships/' + req.userData.dealershipId + '/vehicles/')) {
                    fs.mkdirSync('uploads/dealerships/' + req.userData.dealershipId + '/vehicles/', (createVehicleDirErr) => {
                        if (createVehicleDirErr) {
                            resMessages.logError(createVehicleDirErr);
                            return resMessages.resMessagesToReturn(500, createVehicleDirErr, res);
                        }
                    });
                }

                fs.mkdirSync('uploads/dealerships/' + req.userData.dealershipId + '/vehicles/' + saveResult._id, (createDirErr) => {
                    if (createDirErr) {
                        resMessages.logError(createDirErr);
                        return resMessages.resMessagesToReturn(500, createDirErr, res);
                    }
                });

                for (var i = 0; i < req.files.length; i++) {
                    fs.rename(req.files[i].path, 'uploads/dealerships/' + 
                                req.userData.dealershipId + '/vehicles/' + 
                                saveResult._id + '/' + req.files[i].originalname, (renameErr) => {
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

}