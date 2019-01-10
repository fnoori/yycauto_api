const mongoose = require('mongoose');
const validator = require('validator');
const VehicleModel = require('../models/vehicle');
const UserModel = require('../models/user');
const _ = require('underscore');
const ErrorModel = require('../models/error');
const mongoSanitize = require('mongo-sanitize');
const errorUtils = require('../utils/errorUtils');
const utils = require('../utils/utils');
var cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.get_all_vehicles = (req, res, next) => {
  VehicleModel.find()
  .populate('Dealership').exec()
  .then(vehicle => {
    res.status(201).json(vehicle);
  }).catch(findErr => {
    errorUtils.storeError(500, findErr);
    return res.status(500).json(errorUtils.error_message(utils.MONGOOSE_FIND_FAIL, 500));
  });
}

exports.add_new_vehicle = (req, res, next) => {
  var auth0Id = '';
  var id = '';
  var vehicleData = {};

  if (!validator.isMongoId(req.body.id)) {
    return res.status(400).json(errorUtils.error_message(utils.MONGOOSE_INCORRECT_ID, 400));
  }

  /*
    no need to check if user has provided a field, as this is checked by mongoose via the model
    only need to sanitize for mongodb

    for the optional fields, check if there is data, otherwise input "null"
   */
   if (utils.containsInvalidMongoCharacter(req.body)) {
     return res.status(400).json(errorUtils.error_message(utils.CONTAINS_INVALID_CHARACTER, 400));
   }

   vehicleData['_id'] = new mongoose.Types.ObjectId();

   vehicleData['basicInfo.Make'] = req.body.make;
   vehicleData['basicInfo.Model'] = req.body.model;
   vehicleData['basicInfo.Trim'] = req.body.trim;
   vehicleData['basicInfo.Type'] = req.body.type;
   vehicleData['basicInfo.Year'] = req.body.year;
   vehicleData['basicInfo.Exterior Colour'] = req.body.exterior_colour;
   vehicleData['basicInfo.Interior Colour'] = _.isUndefined(req.body.interior_colour) ? null : req.body.interior_colour;
   vehicleData['basicInfo.Price'] = req.body.price;
   vehicleData['basicInfo.Kilometres'] = req.body.kilometres;
   vehicleData['basicInfo.Fuel Type'] = req.body.fuel_type;
   vehicleData['basicInfo.Doors'] = _.isUndefined(req.body.doors) ? null : req.body.doors;
   vehicleData['basicInfo.Seats'] = _.isUndefined(req.body.seats) ? null : req.body.seats;
   vehicleData['basicInfo.Description'] = _.isUndefined(req.body.description) ? null : req.body.description;

   vehicleData['mechanicalSpecs.CarProof'] = _.isUndefined(req.body.car_proof) ? null : req.body.car_proof;
   vehicleData['mechanicalSpecs.Transmission'] = req.body.transmission;
   vehicleData['mechanicalSpecs.Engine Size (L)'] = _.isUndefined(req.body.engine_size) ? null : req.body.engine_size;
   vehicleData['mechanicalSpecs.Cylinders'] = _.isUndefined(req.body.cylinders) ? null : req.body.cylinders;
   vehicleData['mechanicalSpecs.Hoursepower @ RPM'] = _.isUndefined(req.body.horsepower) ? null : req.body.horsepower;
   vehicleData['mechanicalSpecs.Torque (lb - ft) @ RPM'] = _.isUndefined(req.body.torque) ? null : req.body.torque;
   vehicleData['mechanicalSpecs.Recommended Fuel'] = req.body.recommended_fuel;

   vehicleData['fuelEconomy.City (L/100Km)'] = _.isUndefined(req.body.city_fuel) ? null : req.body.city_fuel;
   vehicleData['fuelEconomy.Highway (L/100Km)'] = _.isUndefined(req.body.highway_fuel) ? null : req.body.highway_fuel;
   vehicleData['fuelEconomy.combined (L/100Km)'] = _.isUndefined(req.body.combined) ? null : req.body.combined;

   vehicleData['Dealership'] = req.body.id;

   // upload tmp vehicle data first
   vehicleData['totalPhotos'] = -1;
   vehicleData['VehicleFeatures'] = _.isUndefined(req.body.features) ? null : req.body.features;

   // temp data here
   vehicleData['AdTier'] = 1;

   //auth0Id = req.user.sub.split('|')[1];
   auth0Id = req.body.auth0_id;
   userId = req.body.id;

   UserModel.findOne({ auth0_id: auth0Id })
   .exec()
   .then(user => {
     if (user) {
       if (userId === String(user._id)) {

         const newVehicle = new VehicleModel(vehicleData);
         newVehicle.save()
         .then(saveResult => {
           res.status(201).json({
             result: 'successfully created vehicle'
           });
         }).catch(saveErr => {
           errorUtils.storeError(500, saveErr);
           return res.status(500).json(errorUtils.error_message(utils.MONGOOSE_SAVE_FAIL, 500));
         });

       } else {
         return res.status(401).json(errorUtils.error_message(utils.UNAUTHORIZED_ACCESS, 401));
       }
     } else {
       return res.status(404).json(errorUtils.error_message(utils.USER_DOES_NOT_EXIST, 404));
     }
   }).catch(findOneErr => {
     errorUtils.storeError(500, findOneErr);
     return res.status(500).json(errorUtils.error_message(utils.MONGOOSE_FIND_ONE_FAIL, 500));
   });
}

exports.add_vehicle_photos = (req, res, next) => {
  var auth0Id = '';
  var id = '';
  var vehicleId = '';
  var photos = [];

  if (!validator.isMongoId(req.body.id)) {
    return res.status(400).json(errorUtils.error_message(utils.MONGOOSE_INCORRECT_ID, 400));
  }
  if (!validator.isMongoId(req.body.vehicle_id)) {
    return res.status(400).json(errorUtils.error_message(utils.MONGOOSE_INCORRECT_ID, 400));
  }

  if (!utils.isArrayLengthCorrect(req.files, utils.MIN_LENGTH, utils.MAX_VEHICLE_PHOTOS)) {
    return res.status(400).json(errorUtils.error_message(utils.INCORRECT_NUMBER_OF_IMAGES, 400));
  }

  // there are files, add to array
  for (file in req.files) {
    photos.push(req.files[file].path);
  }

  //auth0Id = req.user.sub.split('|')[1];
  auth0Id = req.body.auth0_id;
  userId = req.body.id;
  vehicleId = req.body.vehicle_id;

  UserModel.findOne({ auth0_id: auth0Id })
  .exec()
  .then(user => {
    if (user) {
      if (userId === String(user._id)) {

        // user is valid (updating their own inventory)
        VehicleModel.findOneAndUpdate({ _id: vehicleId, 'Dealership': userId }, { totalPhotos: photos.length })
        .populate('Dealership')
        .exec()
        .then(uploaded => {

          // async function needed to upload files in a synchronious manner
          async function uploadToCloudinary() {
            for (photo in photos) {
              await cloudinary.v2.uploader.upload(photos[photo],
              { folder: `${userId}/${vehicleId}`, use_filename: true, unique_filename: false },
              (err, result) => { /* do nothing, handled below */});
            };

            // return promise to confirm all the files have been uploaded before continuing
            return Promise.resolve(1);
          }

          // after uploading files
          uploadToCloudinary().then(uploadResult => {
            res.status(201).json({ message: utils.VEHICLE_PHOTOS_UPLOADED });
          }).catch(cloudinaryErr => {
            errorUtils.storeError(500, cloudinaryErr.message);
            return res.status(500).json(errorUtils.error_message(utils.VEHICLE_PHOTOS_UPLOAD_FAIL, 500));
          }).finally(() => {
            // always delete the files from tmp dir
            errorUtils.deleteFiles(photos);
          });

        }).catch(findOneAndUpdateErr => {
          errorUtils.deleteFiles(photos);
          errorUtils.storeError(500, findOneAndUpdateErr);
          return res.status(500).json(errorUtils.error_message(utils.MONGOOSE_FIND_ONE_AND_UPDATE_FAIL, 500));
        });

      } else {
        errorUtils.deleteFiles(photos);
        return res.status(401).json(errorUtils.error_message(utils.UNAUTHORIZED_ACCESS, 401));
      }
    } else {
      errorUtils.deleteFiles(photos);
      return res.status(404).json(errorUtils.error_message(utils.USER_DOES_NOT_EXIST, 404));
    }
  }).catch(findOneErr => {
    errorUtils.deleteFiles(photos);
    errorUtils.storeError(500, findOneErr);
    return res.status(500).json(errorUtils.error_message(utils.MONGOOSE_FIND_ONE_FAIL, 500));
  });
}

exports.update_vehicle = (req, res, next) => {
  // perform critical checks right at the start
  if (_.isUndefined(req.body.id) || !validator.isMongoId(req.body.id)) {
    return res.status(400).json(errorUtils.error_message(utils.MONGOOSE_INCORRECT_ID, 400));
  }
  if (utils.containsInvalidMongoCharacter(req.body)) {
    return res.status(400).json(errorUtils.error_message(utils.CONTAINS_INVALID_CHARACTER, 400));
  }

  var vehicleDetails = [];

  vehicleDetails.push(_.isUndefined(req.body.make) ? null : { name: utils.MAKE.name, category: utils.BASIC_INFO, details: req.body.make, maxLength: utils.MAKE.max });
  vehicleDetails.push(_.isUndefined(req.body.model) ? null : { name: utils.MODEL.name, category: utils.BASIC_INFO, details: req.body.model, maxLength: utils.MODEL.max });
  vehicleDetails.push(_.isUndefined(req.body.trim) ? null : { name: utils.TRIM.name, category: utils.BASIC_INFO, details: req.body.trim, maxLength: utils.TRIM.max });
  vehicleDetails.push(_.isUndefined(req.body.type) ? null : { name: utils.TYPE.name, category: utils.BASIC_INFO, details: req.body.type, maxLength: utils.TYPE.max });
  vehicleDetails.push(_.isUndefined(req.body.year) ? null : { name: utils.YEAR.name, category: utils.BASIC_INFO, details: req.body.year, maxLength: utils.YEAR.max });
  vehicleDetails.push(_.isUndefined(req.body.exterior_colour) ? null : { name: utils.EXTERIOR_COLOUR.name, category: utils.BASIC_INFO, details: req.body.exterior_colour, maxLength: utils.EXTERIOR_COLOUR.max });
  vehicleDetails.push(_.isUndefined(req.body.interior_colour) ? null : { name: utils.INTERIOR_COLOUR.name, category: utils.BASIC_INFO, details: req.body.interior_colour, maxLength: utils.INTERIOR_COLOUR.max });
  vehicleDetails.push(_.isUndefined(req.body.price) ? null : { name: utils.PRICE.name, category: utils.BASIC_INFO, details: req.body.price, maxLength: utils.PRICE.max });
  vehicleDetails.push(_.isUndefined(req.body.kilometres) ? null : { name: utils.KILOMETRES.name, category: utils.BASIC_INFO, details: req.body.kilometres, maxLength: utils.KILOMETRES.max });
  vehicleDetails.push(_.isUndefined(req.body.fuel_type) ? null : { name: utils.FUEL_TYPE.name, category: utils.BASIC_INFO, details: req.body.fuel_type, maxLength: utils.FUEL_TYPE.max });
  vehicleDetails.push(_.isUndefined(req.body.doors) ? null : { name: utils.DOORS.name, category: utils.BASIC_INFO, details: req.body.doors, maxLength: utils.DOORS.max });
  vehicleDetails.push(_.isUndefined(req.body.seats) ? null : { name: utils.SEATS.name, category: utils.BASIC_INFO, details: req.body.seats, maxLength: utils.SEATS.max });
  vehicleDetails.push(_.isUndefined(req.body.description) ? null : { name: utils.DESCRIPTION.name, category: utils.BASIC_INFO, details: req.body.description, maxLength: utils.DESCRIPTION.max });

  vehicleDetails.push(_.isUndefined(req.body.car_proof) ? null : { name: utils.CAR_PROOF.name, category: utils.MECHANICAL_SPECS, details: req.body.car_proof, maxLength: utils.CAR_PROOF.max });
  vehicleDetails.push(_.isUndefined(req.body.transmission) ? null : { name: utils.TRANSMISSION.name, category: utils.MECHANICAL_SPECS, details: req.body.transmission, maxLength: utils.TRANSMISSION.max });
  vehicleDetails.push(_.isUndefined(req.body.engine_size) ? null : { name: utils.ENGINE_SIZE.name, category: utils.MECHANICAL_SPECS, details: req.body.engine_size, maxLength: utils.ENGINE_SIZE.max });
  vehicleDetails.push(_.isUndefined(req.body.cylinders) ? null : { name: utils.CYLINDERS.name, category: utils.MECHANICAL_SPECS, details: req.body.cylinders, maxLength: utils.CYLINDERS.max });
  vehicleDetails.push(_.isUndefined(req.body.horsepower) ? null : { name: utils.HORSEPOWER.name, category: utils.MECHANICAL_SPECS, details: req.body.horsepower, maxLength: utils.HORSEPOWER.max });
  vehicleDetails.push(_.isUndefined(req.body.torque) ? null : { name: utils.TORQUE.name, category: utils.MECHANICAL_SPECS, details: req.body.torque, maxLength: utils.TORQUE.max });
  vehicleDetails.push(_.isUndefined(req.body.recommended_fuel) ? null : { name: utils.RECOMMENDED_FUEL.name, category: utils.MECHANICAL_SPECS, details: req.body.recommended_fuel, maxLength: utils.RECOMMENDED_FUEL.max });

  vehicleDetails.push(_.isUndefined(req.body.city_fuel) ? null : { name: utils.FUEL_CITY.name, category: utils.FUEL_ECONOMY, details: req.body.city_fuel, maxLength: utils.FUEL_CITY.max });
  vehicleDetails.push(_.isUndefined(req.body.highway_fuel) ? null : { name: utils.FUEL_HIGHWAY.name, category: utils.FUEL_ECONOMY, details: req.body.highway_fuel, maxLength: utils.FUEL_HIGHWAY.max });
  vehicleDetails.push(_.isUndefined(req.body.combined) ? null : { name: utils.FUEL_COMBINED.name, category: utils.FUEL_ECONOMY, details: req.body.combined, maxLength: utils.FUEL_COMBINED.max });

  vehicleDetails.push(_.isUndefined(req.body.features) ? null : { name: utils.VEHICLE_FEATURES.name, category: utils.VEHICLE_FEATURES_CAT, details: req.body.features, maxLength: null });

  var valueLengthTooLong = [];
  var updateData = {};
  var currentDetail = '';
  for (index in vehicleDetails) {
    currentDetail = vehicleDetails[index];
    if (currentDetail && currentDetail.category != utils.VEHICLE_FEATURES_CAT) {
      if (!utils.isLengthCorrect(currentDetail.details, utils.MIN_LENGTH, currentDetail.maxLength)) {
        valueLengthTooLong.push(currentDetail.name);
      } else {
        updateData[`${currentDetail.category}.${currentDetail.name}`] = currentDetail.details;
      }
    } else if (currentDetail && currentDetail.category === utils.VEHICLE_FEATURES_CAT) {
      updateData[`${currentDetail.name}`] = currentDetail.details;
    }
  }

  return res.json(updateData);
}
