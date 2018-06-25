const mongoose = require('mongoose');
const Vehicle = require('../models/vehicle');
const Dealership = require('../models/dealership');
const fs = require('fs');
const rimraf = require('rimraf');

const resMessages = require('../utils/resMessages');
const validations = require('../utils/validations');
const utilities = require('../utils/utility');

const googleBucketReqs = require('../../bucket/googleBucketReqs');
const googleBucket = require('../../bucket/googleBucket');

const rootTempVehicleDir = 'uploads/tmp/vehicles/';

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
            resMessages.resMessagesToReturn(404, resMessages.VEHICLE_NOT_FOUND_WITH_ID, res);
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
            resMessages.resMessagesToReturn(404, resMessages.DEALERSHIP_NOT_FOUND_WITH_ID, res);
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
            resMessages.resMessagesToReturn(404, resMessages.DEALERSHIP_NOT_FOUND_WITH_ID, res);
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
                fs.unlink(rootTempVehicleDir + req.files[i].filename, err => {
                    if (err) {
                        return resMessages.resMessagesToReturn(500, err, res);
                    }
                });
            }
        }

        return resMessages.resMessagesToReturn(403,
            resMessages.DEALERSHIP_ID_TOKEN_NOT_MATCH, res);
    }

    if (req.files.length <= 0) {
        return resMessages.resMessagesToReturn(400, resMessages.MUST_INCLUDE_VEHICLE_PHOTOS, res);
    }
    if (req.files.length > 7) {
        return resMessages.resMessagesToReturn(400, resMessages.MAXIMUM_IMAGES, res);
    }

    allErrors = validations.validateVehicleData(creationOperatinos);

    if (Object.keys(allErrors).length > 0) {
        if (req.files) {
            for (var i = 0; i < req.files.length; i++) {
                fs.unlink(rootTempVehicleDir + req.files[i].filename);
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
            var vehicleData = {};
            delete vehicleData.DealershipId;

            vehicleData['_id'] = new mongoose.Types.ObjectId(),
            vehicleData['Dealership.Email'] = dealershipResult.AccountCredentials.Email;
            vehicleData['Dealership.Name'] = dealershipResult.Name;
            vehicleData['Dealership.Address'] = dealershipResult.Address;
            vehicleData['Dealership.Phone'] = dealershipResult.Phone;
            vehicleData['Dealership._id'] = req.userData.dealershipId;

            vehicleData['BasicInfo.Make'] = vehicleInfo['BasicInfo.Make'];
            vehicleData['BasicInfo.Model'] = vehicleInfo['BasicInfo.Model'];
            vehicleData['BasicInfo.Trim'] = vehicleInfo['BasicInfo.Trim'];
            vehicleData['BasicInfo.Type'] = vehicleInfo['BasicInfo.Type'];
            vehicleData['BasicInfo.Year'] = vehicleInfo['BasicInfo.Year'];
            vehicleData['BasicInfo.Exterior Colour'] = vehicleInfo['BasicInfo.Exterior Colour'];
            vehicleData['BasicInfo.Interior Colour'] = vehicleInfo['BasicInfo.Interior Colour'];
            vehicleData['BasicInfo.Price'] = vehicleInfo['BasicInfo.Price'];
            vehicleData['BasicInfo.Kilometres'] = vehicleInfo['BasicInfo.Kilometres'];
            vehicleData['BasicInfo.Fuel Type'] = vehicleInfo['BasicInfo.Fuel Type'];
            vehicleData['BasicInfo.Doors'] = vehicleInfo['BasicInfo.Doors'];
            vehicleData['BasicInfo.Seats'] = vehicleInfo['BasicInfo.Seats'];
            vehicleData['BasicInfo.Description'] = vehicleInfo['BasicInfo.Description'];
            vehicleData['MechanicalSpecs.CarProof'] = vehicleInfo['MechanicalSpecs.CarProof'];
            vehicleData['MechanicalSpecs.Transmission'] = vehicleInfo['MechanicalSpecs.Transmission'];
            vehicleData['MechanicalSpecs.Engine Size (L)'] = vehicleInfo['MechanicalSpecs.Engine Size (L)'];
            vehicleData['MechanicalSpecs.Cylinders'] = vehicleInfo['MechanicalSpecs.Cylinders'];
            vehicleData['MechanicalSpecs.Horsepower @ RPM'] = vehicleInfo['MechanicalSpecs.Horsepower @ RPM'];
            vehicleData['MechanicalSpecs.Torque (lb - ft) @ RPM'] = vehicleInfo['MechanicalSpecs.Torque (lb - ft) @ RPM'];
            vehicleData['MechanicalSpecs.Recommended Fuel'] = vehicleInfo['MechanicalSpecs.Recommended Fuel'];
            vehicleData['FuelEconomy.City (L/100Km)'] = vehicleInfo['FuelEconomy.City (L/100Km)'];
            vehicleData['FuelEconomy.Highway (L/100Km)'] = vehicleInfo['FuelEconomy.Highway (L/100Km)'];
            vehicleData['FuelEconomy.Combined (L/100Km)'] = vehicleInfo['FuelEconomy.Combined (L/100Km)'];
            vehicleData['AdTier'] = vehicleInfo['AdTier'];
            vehicleData['VehicleFeatures'] = vehicleInfo['VehicleFeatures'];

            var vehiclePhotos = [];
            for (var i = 0; i < req.files.length; i++) {
                vehiclePhotos.push(req.files[i].filename);
            }
            vehicleData['VehiclePhotos'] = vehiclePhotos;

            const newVehicle = new Vehicle(vehicleData);

            // save data
            newVehicle.save().then(saveResult => {
                const dealershipFolder = saveResult.Dealership.Name.split(' ').join('_');

                for (var i = 0; i < req.files.length; i++) {
                    const vehicleDest = '/dealerships/' + dealershipFolder + '/' + saveResult._id + '/' + req.files[i].filename;

                    googleBucketReqs.storage
            		.bucket(googleBucketReqs.bucketName)
            		.upload(rootTempVehicleDir + req.files[i].filename, {destination: vehicleDest})
            		.then(() => {
            		}).catch(bucketError => {
                        resMessages.resMessagesToReturn(500, resMessages.GOOGLE_BUCKET_UPLOAD_ERROR, bucketError);
            		}).finally(function() {
                        fs.unlink(rootTempVehicleDir + req.files[i].filename, err => {
                            if (err) {
                                return resMessages.resMessagesToReturn(500, err, res);
                            }
                        });
            		});
                }

                resMessages.resMessagesToReturn(201, resMessages.VEHICLE_CREATED, res);
            }).catch(saveError => {
                for (var i = 0; i < req.files.length; i++) {
                    fs.unlink(rootTempVehicleDir + req.files[i].filename, err => {
                        if (err) {
                            return resMessages.resMessagesToReturn(500, err, res);
                        }
                    });
                }

                resMessages.logError(saveError);
                resMessages.resMessagesToReturn(500, saveError, res);
            })

        } else {
            resMessages.resMessagesToReturn(404, resMessages.DEALERSHIP_NOT_FOUND_WITH_ID, res);
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
            utilities.emptyDir(rootTempVehicleDir);
        }

        return resMessages.resMessagesToReturn(403,
            resMessages.DEALERSHIP_ID_TOKEN_NOT_MATCH, res);
    }

    // Get dealership name from id
    Dealership.findById(req.params.dealershipId)
    .then(result => {
        const dealershipName = result.Name.split(' ').join('_');
        const prefix = 'dealerships/' + result.Name.split(' ').join('_') + '/' + req.params.vehicleId + '/';

        /*
            Get list of files from Google bucket
            Could not export this to the GoogleBucket file, since it's a Promise,
            and we cannot return a value from a Promise
        */
        googleBucketReqs.storage
        .bucket(googleBucketReqs.bucketName)
        .getFiles({prefix: prefix})
        .then(results => {
            var vehicleImages = [];
            for (var i = 0; i < results[0].length; i++) {
                vehicleImages[i] = results[0][i].name;
            }

            allErrors = validations.validateVehicleData(updateOperations);

            // check if there is already a maximum number files for this vehicle
            if (req.files.length > 0) {
                if (vehicleImages.length >= 7 || (vehicleImages.length + req.files.length) > 7 ) {
                    allErrors['Max Files'] = resMessages.MAX_IMAGES_REACHED_VEHICLE;
                }
            }

            if (Object.keys(allErrors).length > 0) {
                if (req.files) {
                    for (var i = 0; i < req.files.length; i++) {
                        utilities.emptyDir(rootTempVehicleDir);
                    }
                }
                return resMessages.resMessagesToReturn(400, allErrors, res);
            }

            var vehicleData = {};
            vehicleData['BasicInfo.Make'] = updateOperations['BasicInfo.Make'];
            vehicleData['BasicInfo.Model'] = updateOperations['BasicInfo.Model'];
            vehicleData['BasicInfo.Trim'] = updateOperations['BasicInfo.Trim'];
            vehicleData['BasicInfo.Type'] = updateOperations['BasicInfo.Type'];
            vehicleData['BasicInfo.Year'] = updateOperations['BasicInfo.Year'];
            vehicleData['BasicInfo.Exterior Colour'] = updateOperations['BasicInfo.Exterior Colour'];
            vehicleData['BasicInfo.Interior Colour'] = updateOperations['BasicInfo.Interior Colour'];
            vehicleData['BasicInfo.Price'] = updateOperations['BasicInfo.Price'];
            vehicleData['BasicInfo.Kilometres'] = updateOperations['BasicInfo.Kilometres'];
            vehicleData['BasicInfo.Fuel Type'] = updateOperations['BasicInfo.Fuel Type'];
            vehicleData['BasicInfo.Doors'] = updateOperations['BasicInfo.Doors'];
            vehicleData['BasicInfo.Seats'] = updateOperations['BasicInfo.Seats'];
            vehicleData['BasicInfo.Description'] = updateOperations['BasicInfo.Description'];
            vehicleData['MechanicalSpecs.CarProof'] = updateOperations['MechanicalSpecs.CarProof'];
            vehicleData['MechanicalSpecs.Transmission'] = updateOperations['MechanicalSpecs.Transmission'];
            vehicleData['MechanicalSpecs.Engine Size (L)'] = updateOperations['MechanicalSpecs.Engine Size (L)'];
            vehicleData['MechanicalSpecs.Cylinders'] = updateOperations['MechanicalSpecs.Cylinders'];
            vehicleData['MechanicalSpecs.Horsepower @ RPM'] = updateOperations['MechanicalSpecs.Horsepower @ RPM'];
            vehicleData['MechanicalSpecs.Torque (lb - ft) @ RPM'] = updateOperations['MechanicalSpecs.Torque (lb - ft) @ RPM'];
            vehicleData['MechanicalSpecs.Recommended Fuel'] = updateOperations['MechanicalSpecs.Recommended Fuel'];
            vehicleData['FuelEconomy.City (L/100Km)'] = updateOperations['FuelEconomy.City (L/100Km)'];
            vehicleData['FuelEconomy.Highway (L/100Km)'] = updateOperations['FuelEconomy.Highway (L/100Km)'];
            vehicleData['FuelEconomy.Combined (L/100Km)'] = updateOperations['FuelEconomy.Combined (L/100Km)'];
            vehicleData['AdTier'] = updateOperations['AdTier'];
            vehicleData['VehicleFeatures'] = updateOperations['VehicleFeatures'];

            var vehiclePhotos = [];
            for (var i = 0; i < req.files.length; i++) {
                vehiclePhotos.push(req.files[i].filename);
            }

            // since the validation is already done earlier, simply pass the update operations to $set
            Vehicle.update({_id: req.params.vehicleId}, {$set: vehicleData, $push: {VehiclePhotos: {$each: vehiclePhotos}}})
            .exec().then(result => {
                if (result.n != 0) {
                    if (req.files.length > 0) {
                        for (var i = 0; i < req.files.length; i++) {
                            const vehicleDest = '/dealerships/' + dealershipName + '/' + req.params.vehicleId + '/' + req.files[i].filename;

                            googleBucketReqs.storage
                            .bucket(googleBucketReqs.bucketName)
                            .upload(rootTempVehicleDir + req.files[i].filename, {destination: vehicleDest})
                            .then(() => {
                            }).catch(bucketError => {
                                resMessages.resMessagesToReturn(500, GOOGLE_BUCKET_UPLOAD_ERROR, bucketError);
                            }).finally(function() {
                                fs.unlink(rootTempVehicleDir + req.files[i].filename, err => {
                                    if (err) {
                                        return resMessages.resMessagesToReturn(500, err, res);
                                    }
                                });
                            });
                        }
                    }
                } else {
                    resMessages.resMessagesToReturn(400, resMessages.VEHICLE_NOT_FOUND_WITH_ID, res);
                }
                resMessages.resMessagesToReturn(200, resMessages.VEHICLE_UPDATED, res);
            }).catch(err => {
                utilities.emptyDir(rootTempVehicleDir);
                resMessages.logError(err);
                resMessages.resMessagesToReturn(500, err, res);
            });
        }).catch(bucketErr => {
            console.error('Google Bucket Error:', bucketErr);
        });
    }).catch(err => {
        console.log('MongoDB findById Error', err);
    });
}

exports.deleteVehicle = (req, res, next) => {
    const dealershipId = req.params.dealershipId;
    const vehicleId = req.params.vehicleId;

    // ensure dealership is deleting to their own inventory
    if (req.userData.dealershipId != dealershipId) {
        return resMessages.resMessagesToReturn(403,
            resMessages.DEALERSHIP_ID_TOKEN_NOT_MATCH, res);
    }

    Vehicle.remove({'_id': vehicleId, 'Dealership._id': dealershipId})
    .exec().then(result => {
        console.log(result);
        if (result.n === 0) {
            return resMessages.resMessagesToReturn(500, resMessages.SERVER_DELETE_VEHICLE_ERROR, res);
        }

        // Get dealership name from id
        Dealership.findById(req.params.dealershipId)
        .then(result => {
            const prefix = 'dealerships/' + result.Name.split(' ').join('_') + '/' + req.params.vehicleId + '/';

            googleBucketReqs.storage
    		.bucket(googleBucketReqs.bucketName)
    		.deleteFiles({prefix: prefix})
    		.then(() => {
    			console.log(`${prefix} deleted successfully.`);
    		}).catch (bucketErr => {
    			console.log('Google Bucket Error', bucketErr);
    		});

        }).catch(deleteErr => {
            resMessages.logError(deleteErr);
            resMessages.resMessagesToReturn(500, removeErr, res);
        });

        return resMessages.resMessagesToReturn(200, resMessages.VEHICLE_DELETED_SUCCESSFULLY, res);
    }).catch(removeErr => {
        resMessages.logError(removeErr);
        resMessages.resMessagesToReturn(500, removeErr, res);
    });
}

exports.deleteVehiclePhotos = (req, res, next) => {
    const dealershipId = req.params.dealershipId;
    const vehicleId = req.params.vehicleId;
    const images = JSON.parse(req.query.imageArray);

    // ensure dealership is deleting to their own inventory
    if (req.userData.dealershipId != dealershipId) {
        return resMessages.resMessagesToReturn(403,
            resMessages.DEALERSHIP_ID_TOKEN_NOT_MATCH, res);
    }

    // Get dealership name from id
    Dealership.findById(req.params.dealershipId)
    .then(result => {
        for (var i = 0; i < images.length; i++) {
            const filename = 'dealerships/' + result.Name.split(' ').join('_') + '/' + req.params.vehicleId + '/' + images[i];

            googleBucketReqs.storage
    		.bucket(googleBucketReqs.bucketName)
    		.file(filename).delete()
    		.then(() => {
    			//console.log(`${file} deleted successfully.`);
                Vehicle.update({_id: req.params.vehicleId}, {$pull: {VehiclePhotos: {$in: images}}})
                .exec().then(result => {
                }).catch(updateErr => {
                    resMessages.logError(updateErr);
                    resMessages.resMessagesToReturn(500, updateErr, res);
                });

                resMessages.resMessagesToReturn(200, resMessages.PHOTO_DELETED_SUCCESSFULLY, res);
    		}).catch (bucketErr => {
    			console.log('Google Bucket Error', bucketErr);
                resMessages.resMessagesToReturn(400, bucketErr, res);
    		});
        }
    }).catch(deleteErr => {
        resMessages.logError(deleteErr);
        resMessages.resMessagesToReturn(500, deleteErr, res);
    });
}
