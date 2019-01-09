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
  /*
  const make = _.isUndefined(mongoSanitize(req.body.make)) ? null : mongoSanitize(req.body.make);
  const model = _.isUndefined(mongoSanitize(req.body.model)) ? null : mongoSanitize(req.body.model);
  const trim = _.isUndefined(mongoSanitize(req.body.trim)) ? null : mongoSanitize(req.body.trim);

  if (make) {
    if (!utils.isLengthCorrect(make, utils.MIN_LENGTH, utils.MAKE_MAX_LENGTH)) {
      return res.status(400).json(errorUtils.error_message(utils.lengthTooLong(utils.MAKE)));
    } else {
      vehicleData['basicInfo.Make'] = make;
    }
  }
  if (model) {
    if (!utils.isLengthCorrect(model, utils.MIN_LENGTH, utils.MODEL_MAX_LENGTH)) {
      return res.status(400).json(errorUtils.error_message(utils.lengthTooLong(utils.MAKE)));
    } else {
      vehicleData['basicInfo.Model'] = model;
    }
  }
  if (trim) {
    if (!utils.isLengthCorrect(trim, utils.MIN_LENGTH, utils.MODEL_MAX_LENGTH)) {
      return res.status(400).json(errorUtils.error_message(utils.lengthTooLong(utils.MAKE)));
    } else {
      vehicleData['basicInfo.Trim'] = trim;
    }
  }

  return res.json(vehicleData);
  */
}
