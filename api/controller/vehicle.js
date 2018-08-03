const mongoose = require('mongoose');
const Vehicle = require('../model/vehicle');
const Dealership = require('../model/dealership');
const fs = require('fs');

const rootTempVehicleDir = 'uploads/tmp/vehicles/';
const messages = require('../utils/messages');
const utils = require('../utils/utils');
const bucketStorage = require('../utils/googleBucket');

const omitFromFind = '-__v -dealership._id';
const tmpDir = 'uploads/tmp/';

exports.getAllVehicles = (req, res, next) => {
  const lazyLoad = parseInt(req.params.lazyLoad);
  const perPage = parseInt(req.params.perPage);

  Vehicle.find()
    .skip(lazyLoad).limit(perPage)
    .populate('Dealership')
    .select(omitFromFind)
    .exec().then(docs => {
      res.status(200).send(docs);
    }).catch(vehicleFindErr => {
      return res.status(500).send({
        'vehicleFindErr': vehicleFindErr.message
      });
    });
};

exports.addNewVehicle = (req, res, next) => {
  var files = [];

  // rename incoming files with their proper extensions
  for (var i = 0; i < req.files.length; i++) {
    fs.renameSync(req.files[i].path, req.files[i].path + '.' + req.files[i].mimetype.split('/')[1]);
    files[i] = req.files[i].filename + '.' + req.files[i].mimetype.split('/')[1];
  }

  Dealership.findById(req.userData.dealershipId)
    .then(checkPermission => {

      if (req.userData.dealershipId !== req.params.dealership_id &&
        (Number(checkPermission.permission) !== 1)) {
        return (res.status(403).send({ '403 -- ERROR': messages.UNAUTHORIZED_ACTION }));
      }

      var vehicle = {};
      vehicle['_id'] = new mongoose.Types.ObjectId();
      vehicle['basic_info.make'] = req.body.make;
      vehicle['basic_info.model'] = req.body.model;
      vehicle['basic_info.trim'] = req.body.trim;
      vehicle['basic_info.type'] = req.body.type;
      vehicle['basic_info.year'] = req.body.year;
      vehicle['basic_info.exterior_colour'] = req.body.exterior_colour;
      vehicle['basic_info.interior_colour'] = req.body.interior_colour;
      vehicle['basic_info.price.initial'] = req.body.initial;
      vehicle['basic_info.price.updated'] = req.body.updated;
      vehicle['basic_info.kilometres'] = req.body.kilometres;
      vehicle['basic_info.fuel_type'] = req.body.fuel_type;
      vehicle['basic_info.doors'] = req.body.doors;
      vehicle['basic_info.seats'] = req.body.seats;
      vehicle['basic_info.description'] = req.body.description;

      vehicle['mechanical_specs.car_proof'] = req.body.car_proof;
      vehicle['mechanical_specs.transmission'] = req.body.transmission;
      vehicle['mechanical_specs.engine_size'] = req.body.engine_size;
      vehicle['mechanical_specs.cylinders'] = req.body.cylinders;
      vehicle['mechanical_specs.horsepower'] = req.body.horsepower;
      vehicle['mechanical_specs.torque'] = req.body.torque;
      vehicle['mechanical_specs.recommended_fuel'] = req.body.recommended_fuel;

      vehicle['fuel_economy.city'] = req.body.fuel_economy;
      vehicle['fuel_economy.highway'] = req.body.fuel_economy;
      vehicle['fuel_economy.combined'] = req.body.fuel_economy;

      vehicle['dealership'] = req.params.dealership_id;

      vehicle['vehicle_photos'] = req.body.vehicle_photos;
      vehicle['vehicle_features'] = req.body.vehicle_features;

      vehicle['ad_tier'] = '1';
      vehicle['created'] = Date.now();
      vehicle['updated'] = Date.now();

      const newVehicle = new Vehicle(vehicle);
      newVehicle.save().then(vehicleSave => {
        newVehicle.populate('dealership', (err) => {
          if (err) {
            console.log(err);
            return res.status(500).send({ 'dealershipPopulateErr': err.message });
          }

          var vehicleDestination = null;
          const dealershipFolder = '/dealerships/' + vehicleSave.dealership.name.split(' ').join('_') + '/';
          for (var i = 0; i < req.files.length; i++) {
            vehicleDestination = dealershipFolder + vehicleSave._id + '/' + req.files[i].filename + '.' + req.files[i].mimetype.split('/')[1];
            
            bucketStorage.storage
              .bucket(bucketStorage.bucketName)
              .upload(tmpDir + req.files[i].filename + '.' + req.files[i].mimetype.split('/')[1],
                { destination: vehicleDestination })
              .then(() => {
                fs.unlink(tmpDir + tmpDir + req.files[i].filename + '.' + req.files[i].mimetype.split('/')[1])
                .then(() => {
                }).catch(unlinkErr => {
                  return res.status(500).send({ 'unlinkErr': unlinkErr.message });  
                });
              }).catch(bucketUploadErr => {
                return res.status(500).send({ 'bucketUploadErr': bucketUploadErr.message });
              });
          }

          //utils.deleteFilesFromTmpDir(files);
          res.status(200).send(`Vehicle with id ${vehicleSave._id} saved successfully`);
        });
      }).catch(newVehicleSaveErr => {
        return res.status(500).send({ 'newVehicleSaveErr': newVehicleSaveErr.message });
      });
    }).catch(checkPermissionErr => {
      return res.status(500).send({ 'checkPermissionErr': checkPermissionErr.message });
    });
};

exports.updateVehicle = (req, res, next) => {
  Dealership.findById(req.userData.dealershipId)
    .then(checkPermission => {
      if (req.userData.dealershipId !== req.params.dealership_id &&
        (Number(checkPermission.permission) !== 1)) {
        return (res.status(403).send({ '403 -- ERROR': messages.UNAUTHORIZED_ACTION }));
      }

    }).catch(checkPermissionErr => {
      return res.status(500).send({ 'checkPermissionErr': checkPermissionErr.message });
    });
};