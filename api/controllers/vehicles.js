const mongoose = require('mongoose');
const Vehicle = require('../models/vehicle');
const Dealership = require('../models/dealership');
const resMessages = require('../utils/resMessages');
const fs = require('fs');

const omitFromFind = '-_id -Dealership._id';

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
    // ensure dealership is adding to their own inventory
    if (req.userData.dealershipId != req.params.dealershipId) {
        return resMessages.resMessagesToReturn(403,
            resMessages.DEALERSHIP_ID_TOKEN_NOT_MATCH, res);
    }

    const vehicleInfo = req.body; 

    Dealership.findById(vehicleInfo.DealershipId)
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
            vehicleData['Dealership._id'] = dealershipResult._id;

            const newVehicle = new Vehicle(vehicleData);

            newVehicle.save().then(saveResult => {

                fs.mkdirSync('uploads/dealerships/' + saveResult.Dealership._id + '/vehicles/' + saveResult._id, (createDirErr) => {
                    if (createDirErr) {
                        resMessages.logError(createDirErr);
                        return resMessages.resMessagesToReturn(500, createDirErr, res);
                    }
                });

                for (var i = 0; i < req.files.length; i++) {
                    fs.rename(req.files[i].path, 'uploads/dealerships/' + 
                                saveResult.Dealership._id + '/vehicles/' + 
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