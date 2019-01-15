const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('underscore');
const mongoSanitize = require('mongo-sanitize');
const fs = require('fs');
var cloudinary = require('cloudinary');

const VehicleModel = require('../models/vehicle');
const UserModel = require('../models/user');
const ErrorModel = require('../models/error');
const errorUtils = require('../utils/errorUtils');
const utils = require('../utils/utils');

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

/*
  Needs to be async so we can be certain the vehicle has been created
  successfully
 */
exports.add_new_vehicle = async (req, res, next) => {
  var auth0Id = '';
  var id = '';
  var vehicleData = {};

  if (_.isUndefined(req.body.id) || !validator.isMongoId(req.body.id)) {
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

   auth0Id = eval(process.env.AUTH0_ID_SOURCE);
   userId = req.body.id;

   var user;
   var vehicleSaved;
   try {
     user = await UserModel.findOne({ auth0_id: auth0Id });

     if (!user) {
       return res.status(404).json(errorUtils.error_message(utils.USER_DOES_NOT_EXIST, 404));
     }
     if (!validator.equals(String(user._id), userId)) {
       return res.status(404).json(errorUtils.error_message(utils.UNAUTHORIZED_ACCESS, 404));
     }

     const newVehicle = new VehicleModel(vehicleData);
     vehicleSaved = await newVehicle.save();
     if (!vehicleSaved) {
       return res.status(500).json(errorUtils.error_message(utils.MONGOOSE_SAVE_FAIL, 500));
     }

   } catch (e) {
     return res.status(500).json({error: e.message});
   }
}

/*
  Needs to be async so we can be certain file is uploaded
  correctly
 */
exports.add_vehicle_photos = async (req, res, next) => {
  var auth0Id = '';
  var id = '';
  var vehicleId = '';

  if (_.isUndefined(req.body.id) || !validator.isMongoId(req.body.id)) {
    return res.status(400).json(errorUtils.error_message(utils.MONGOOSE_INCORRECT_ID, 400));
  }
  if (!validator.isMongoId(req.body.vehicle_id)) {
    return res.status(400).json(errorUtils.error_message(utils.MONGOOSE_INCORRECT_ID, 400));
  }
  if (!utils.isArrayLengthCorrect(req.files, utils.MIN_LENGTH, utils.MAX_VEHICLE_PHOTOS)) {
    return res.status(400).json(errorUtils.error_message(utils.INCORRECT_NUMBER_OF_IMAGES, 400));
  }

  auth0Id = eval(process.env.AUTH0_ID_SOURCE);
  userId = req.body.id;
  vehicleId = req.body.vehicle_id;

  var user;
  var vehicle;
  try {
    user = await UserModel.findOne({ auth0_id: auth0Id });

    if (!user) {
      utils.deleteFiles(req.files);
      return res.status(404).json(errorUtils.error_message(utils.USER_DOES_NOT_EXIST, 404));
    }
    if (!validator.equals(String(user._id), userId)) {
      utils.deleteFiles(req.files);
      return res.status(404).json(errorUtils.error_message(utils.UNAUTHORIZED_ACCESS, 404));
    }

    vehicle = await VehicleModel.findOneAndUpdate({ _id: vehicleId, 'Dealership': userId }, { totalPhotos: req.files.length }).populate('Dealership');
    if (!vehicle) {
      utils.deleteFiles(req.files);
      return res.status(404).json(errorUtils.error_message(utils.VEHICLE_DOES_NOT_EXIST, 404));
    }

    fs.mkdirSync(`./test/imagesUploaded/${userId}/${vehicleId}`, { recursive: true });
    for (var i = 0; i < req.files.length; i++) {
      fs.renameSync(req.files[i].path, `./test/imagesUploaded/${userId}/${vehicleId}/${req.files[i].filename}`);
    }

    res.status(201).json({ message: utils.VEHICLE_PHOTOS_UPLOADED });

  } catch (e) {
    utils.deleteFiles(req.files);
    return res.status(500).json({error: e.message});
  }
}

exports.update_vehicle = (req, res, next) => {
  var vehicleDetails = [];
  var auth0Id = '';
  var id = '';
  var vehicleId = '';

  // perform critical checks right at the start
  if (_.isUndefined(req.body.id) || !validator.isMongoId(req.body.id)) {
    return res.status(400).json(errorUtils.error_message(utils.MONGOOSE_INCORRECT_ID, 400));
  }
  if (utils.containsInvalidMongoCharacter(req.body)) {
    return res.status(400).json(errorUtils.error_message(utils.CONTAINS_INVALID_CHARACTER, 400));
  }

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

  vehicleDetails.push(_.isUndefined(req.body.features) ? null : { name: utils.VEHICLE_FEATURES.name, category: utils.VEHICLE_FEATURES_IS_ARRAY, details: req.body.features, maxLength: null });

  var valueLengthTooLong = [];
  var updateData = {};
  var currentDetail = '';
  for (index in vehicleDetails) {
    currentDetail = vehicleDetails[index];
    if (currentDetail && currentDetail.category != utils.VEHICLE_FEATURES_IS_ARRAY) {
      if (!utils.isLengthCorrect(currentDetail.details, utils.MIN_LENGTH, currentDetail.maxLength)) {
        valueLengthTooLong.push(currentDetail.name);
      } else {
        updateData[`${currentDetail.category}.${currentDetail.name}`] = currentDetail.details;
      }
    } else if (currentDetail && currentDetail.category === utils.VEHICLE_FEATURES_IS_ARRAY) {
      updateData[`${currentDetail.name}`] = currentDetail.details;
    }
  }

  auth0Id = eval(process.env.AUTH0_ID_SOURCE);
  userId = req.body.id;
  vehicleId = req.body.vehicle_id;

  UserModel.findOne({ auth0_id: auth0Id })
  .then(user => {
    if (user) {

      // updating correct inventory
      if (userId === String(user._id)) {
        VehicleModel.findOneAndUpdate({ _id: vehicleId, 'Dealership': userId }, updateData)
        .populate('Dealership')
        .exec()
        .then(updated => {
          res.status(201).json({ message: utils.VEHICLE_UPDATED_SUCCESSFULLY });
        }).catch(findOneAndUpdateErr => {
          errorUtils.storeError(500, findOneAndUpdateErr);
          return res.status(500).json(errorUtils.error_message(utils.MONGOOSE_FIND_ONE_AND_UPDATE_FAIL, 500));
        });
      }

    }
  }).catch(findOneErr => {
    errorUtils.storeError(500, findOneErr);
    return res.status(500).json(errorUtils.error_message(utils.MONGOOSE_FIND_ONE_FAIL, 500));
  });
}
