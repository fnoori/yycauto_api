const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('underscore');
const mongoSanitize = require('mongo-sanitize');
const fs = require('fs');
const rimraf = require('rimraf');
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
  .populate('Dealership', '-_id -auth0_id -__v')
  .select('-__v').exec()
  .then(vehicles => {
    res.status(201).json(vehicles);
  }).catch(findErr => {
    errorUtils.storeError(500, findErr);
    return res.status(500).json(errorUtils.error_message(utils.MONGOOSE_FIND_FAIL, 500));
  });
}

exports.get_vehicle_by_id = (req, res, next) => {
  var vehicleId;

  if (_.isUndefined(req.body.vehicle_id) || !validator.isMongoId(req.body.vehicle_id)) {
    return res.status(400).json(errorUtils.error_message(utils.MONGOOSE_INCORRECT_ID, 400));
  }

  vehicleId = req.body.vehicle_id;

  VehicleModel.findById(vehicleId)
  .populate('Dealership', '-_id -auth0_id -__v')
  .select('-__v').exec()
  .then(vehicle => {
    res.json(vehicle);
  }).catch(findByIdErr => {
    errorUtils.storeError(500, findByIdErr);
    return res.status(500).json(errorUtils.error_message(utils.MONGOOSE_FIND_BY_ID_FAIL, 500));
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

   if (_.isUndefined(req.files)) {
     return res.status(400).json(errorUtils.error_message(utils.MUST_UPLOAD_AT_LEAST_ONE, 400));
   }
   if (!utils.isArrayLengthCorrect(req.files, utils.MIN_LENGTH, utils.MAX_VEHICLE_PHOTOS)) {
     return res.status(400).json(errorUtils.error_message(utils.INCORRECT_VEHICLE_PHOTOS, 400));
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
   vehicleData['totalPhotos'] = req.files.length;
   vehicleData['date.created'] = new Date();
   vehicleData['date.modified'] = new Date();

   // temp data here
   vehicleData['AdTier'] = 1;

   auth0Id = eval(process.env.AUTH0_ID_SOURCE);
   userId = req.body.id;

   var user;
   var vehicleSaved;
   var cloudinaryRename;
   try {
     user = await UserModel.findOne({ auth0_id: auth0Id });

     if (!user) {
       // delete files from cloudinary upload dir here
       return res.status(404).json(errorUtils.error_message(utils.USER_DOES_NOT_EXIST, 404));
     }
     if (!validator.equals(String(user._id), userId)) {
       return res.status(404).json(errorUtils.error_message(utils.UNAUTHORIZED_ACCESS, 404));
     }

     const newVehicle = new VehicleModel(vehicleData);
     vehicleSaved = await newVehicle.save();
     if (!vehicleSaved) {
       // delete files from cloudinary upload dir here
       return res.status(500).json(errorUtils.error_message(utils.MONGOOSE_SAVE_FAIL, 500));
     }

     for (var i = 0; i < req.files.length; i++) {
       cloudinaryRename = await cloudinary.v2.uploader.rename(req.files[i].public_id, `production/users/${user._id}/${vehicleSaved._id}/${req.files[i].public_id.split('/')[2]}.${req.files[i].format}`);

       if (!cloudinaryRename) {
         errorUtils.storeError(500, utils.CLOUDINARY_UPLOAD_FAIL);
         return res.status(500).json(errorUtils.error_message(utils.CLOUDINARY_UPLOAD_FAIL, 500));
       }
     }

     res.json({ message: utils.VEHICLE_CREATED_SUCCESSFULLY });

   } catch (e) {
     // delete files from cloudinary upload dir here
     return res.status(500).json({error: e.message});
   }
}

exports.update_vehicle = async (req, res, next) => {
  var vehicleDetails = [];
  var auth0Id = '';
  var id = '';
  var vehicleId = '';
  var includesFiles = false;

  // perform critical checks right at the start
  if (_.isUndefined(req.body.id) || !validator.isMongoId(req.body.id)) {
    return res.status(400).json(errorUtils.error_message(utils.MONGOOSE_INCORRECT_ID, 400));
  }
  if (utils.containsInvalidMongoCharacter(req.body)) {
    return res.status(400).json(errorUtils.error_message(utils.CONTAINS_INVALID_CHARACTER, 400));
  }

  if (!_.isUndefined(req.files) && req.files.length > 0) {
    includesFiles = true;
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

  var valueLengthTooLong = [];
  var updateData = {};
  var currentDetail = '';
  for (index in vehicleDetails) {
    currentDetail = vehicleDetails[index];
    if (currentDetail && currentDetail.category) {
      if (!utils.isLengthCorrect(currentDetail.details, utils.MIN_LENGTH, currentDetail.maxLength)) {
        valueLengthTooLong.push(currentDetail.name);
      } else {
        updateData[`${currentDetail.category}.${currentDetail.name}`] = currentDetail.details;
      }
    }
  }

  updateData['date.modified'] = new Date();

  auth0Id = eval(process.env.AUTH0_ID_SOURCE);
  userId = req.body.id;
  vehicleId = req.body.vehicle_id;

  var user;
  var updatedVehicle;
  var cloudinaryRename;
  try {
    user = await UserModel.findOne({ auth0_id: auth0Id });

    if (!user) {
      if (includesFiles) {
        // delete files from cloudinary upload dir here
      }
      return res.status(404).json(errorUtils.error_message(utils.USER_DOES_NOT_EXIST, 404));
    }
    if (!validator.equals(String(user._id), userId)) {
      if (includesFiles) {
        // delete files from cloudinary upload dir here
      }
      return res.status(404).json(errorUtils.error_message(utils.UNAUTHORIZED_ACCESS, 404));
    }

    const vehicleToUpdate = await VehicleModel.findOne({ _id: vehicleId });
    if (!vehicleToUpdate) {
      return res.status(404).json(errorUtils.error_message(utils.VEHICLE_DOES_NOT_EXIST, 404));
    }
    if ((includesFiles && vehicleToUpdate.totalPhotos >= 7) || (vehicleToUpdate.totalPhotos + req.files.length > 7)) {
      // delete file from cloudinary upload dir
      return res.status(400).json(errorUtils.error_message(utils.REACHED_MAXIMUM_VEHICLE_PHOTOS, 400));
    }

    updateData['$inc'] = { totalPhotos: req.files.length };
    //updatedVehicle = await VehicleModel.findOneAndUpdate({ _id: vehicleId, 'Dealership': userId }, updateData).populate('Dealership');
    updatedVehicle = await VehicleModel.findOneAndUpdate({ _id: vehicleId, 'Dealership': userId },
                            updateData).populate('Dealership');
    if (!updatedVehicle) {
      if (includesFiles) {
        // delete files from cloudinary upload dir here
      }
      return res.status(500).json(errorUtils.error_message(utils.MONGOOSE_FIND_ONE_AND_UPDATE_FAIL, 500));
    }

    for (var i = 0; i < req.files.length; i++) {
      cloudinaryRename= await cloudinary.v2.uploader.rename(req.files[i].public_id, `production/users/${user._id}/${updatedVehicle._id}/${req.files[i].public_id.split('/')[2]}.${req.files[i].format}`);
      if (!cloudinaryRename) {
        errorUtils.storeError(500, utils.CLOUDINARY_UPLOAD_FAIL);
        return res.status(500).json(errorUtils.error_message(utils.CLOUDINARY_UPLOAD_FAIL, 500));
      }
    }

    res.json({ message: utils.VEHICLE_UPDATED_SUCCESSFULLY });

  } catch (e) {
    if (includesFiles) {
      // delete files from cloudinary upload dir here
    }
    return res.status(500).json({error: e.message});
  }
}

exports.delete_images = async (req, res, next) => {
  var auth0Id = '';
  var id = '';
  var vehicleId = '';
  var imagesToDelete = [];

  if (_.isUndefined(req.body.id) || !validator.isMongoId(req.body.id)) {
    return res.status(400).json(errorUtils.error_message(utils.MONGOOSE_INCORRECT_ID, 400));
  }
  if (utils.containsInvalidMongoCharacter(req.body)) {
    return res.status(400).json(errorUtils.error_message(utils.CONTAINS_INVALID_CHARACTER, 400));
  }
  if (!_.isUndefined(req.body.images_to_delete)) {
    imagesToDelete = req.body.images_to_delete;
  } else {
    return res.status(400).json(errorUtils.error_message(utils.DELETE_AT_LEAST_ONE_IMAGE, 400));
  }


  auth0Id = eval(process.env.AUTH0_ID_SOURCE);
  userId = req.body.id;
  vehicleId = req.body.vehicle_id;

  var user;
  var deleted;
  var filesDeleted;
  var updatedInCollection;
  try {
    user = await UserModel.findOne({ auth0_id: auth0Id });

    if (!user) {
      return res.status(404).json(errorUtils.error_message(utils.USER_DOES_NOT_EXIST, 404));
    }
    if (!validator.equals(String(user._id), userId)) {
      return res.status(404).json(errorUtils.error_message(utils.UNAUTHORIZED_ACCESS, 404));
    }

    for (var i = 0; i < imagesToDelete.length; i++) {
      var deleteRes = fs.unlinkSync(`./test/imagesUploaded/${userId}/${vehicleId}/${imagesToDelete[i]}`);
      if (deleteRes) {
        return res.status(500).json(errorUtils.error_message(utils.DELETE_IMAGE_FAIL, 500));
      }
    }

    updatedInCollection = await VehicleModel.findOneAndUpdate({ 'Dealership': userId }, { $inc: { 'totalPhotos': -imagesToDelete.length } }).populate('Dealership');
    if (!updatedInCollection) {
      return res.status(500).json(errorUtils.error_message(utils.MONGOOSE_FIND_ONE_AND_UPDATE_FAIL, 500));
    }

    res.json({ message: 'Successfully deleted image(s)' });
  } catch (e) {
    return res.status(500).json({error: e.message});
  }
}

exports.delete_vehicle = async (req, res, next) => {
  var auth0Id = '';
  var id = '';

  if (_.isUndefined(req.body.id) || !validator.isMongoId(req.body.id)) {
    return res.status(400).json(errorUtils.error_message(utils.MONGOOSE_INCORRECT_ID, 400));
  }

  auth0Id = eval(process.env.AUTH0_ID_SOURCE);
  userId = req.body.id;
  vehicleId = req.body.vehicle_id;

  var user;
  var deleted;
  var filesDeleted;
  try {
    user = await UserModel.findOne({ auth0_id: auth0Id });

    if (!user) {
      return res.status(404).json(errorUtils.error_message(utils.USER_DOES_NOT_EXIST, 404));
    }
    if (!validator.equals(String(user._id), userId)) {
      return res.status(404).json(errorUtils.error_message(utils.UNAUTHORIZED_ACCESS, 404));
    }

    deleted = await VehicleModel.deleteOne({ _id: vehicleId });
    if (!deleted) {
      return res.status(500).json(errorUtils.error_message(utils.MONGOOSE_DELETE_ONE_FAIL, 500));
    }

    rimraf.sync(`./test/imagesUploaded/${userId}/${vehicleId}/`);

    res.json({ message: utils.DELETE_VEHICLE_SUCCESSFULLY });

  } catch (e) {
    return res.status(500).json({error: e.message});
  }
}
