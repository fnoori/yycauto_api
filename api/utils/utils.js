const _ = require('underscore');
const validator = require('validator');
const fs = require('fs');

exports.MONGOOSE_FIND_FAIL = 'mongoose.find() failed';
exports.MONGOOSE_INCORRECT_ID = 'Incorrect id format';
exports.MONGOOSE_FIND_BY_ID_FAIL = 'mongoose.findById() failed';
exports.MONGOOSE_FIND_ONE_FAIL = 'mongoose.findOne() failed';
exports.MONGOOSE_SUCCESSFUL_UPDATE = 'Successfully updated';
exports.MONGOOSE_SAVE_FAIL = 'mongoose.save() failed';
exports.MONGOOSE_UPDATE_ONE_FAIL = 'mongoose.updateOne() failed';
exports.MONGOOSE_FIND_ONE_AND_UPDATE_FAIL = 'mongoose.findOneAndUpdate() failed';
exports.MONGOOSE_POPULATE_FAIL = 'mongoose.populate() failed';
exports.MONGOOSE_DELETE_ONE_FAIL = 'mongoose.deleteOne() failed';
exports.MONGOOSE_AGGREGATE_FAIL = 'mongoose.aggregate() failed';

exports.INCORRECT_PHONE_FORMAT = 'Incorrect phone number format';
exports.AT_LEAST_ONE_FIELD_REQUIRED = 'At least one field must be provided to update';
exports.UNAUTHORIZED_ACCESS = 'unauthorized access';
exports.USER_DOES_NOT_EXIST = 'User doesn\'t exist';
exports.USE_24_HOUR_FORMAT = 'Must use 24 hour time format';
exports.TIME_MUST_BE_NUMBERS = 'Times must be numbers';
exports.ADDRESS_INCORRECT_LENGTH = 'Incorrect address length';
exports.DEALERSHIP_NAME_INCORRECT_LENGTH = 'Incorrect dealership name length';
exports.CONTAINS_INVALID_CHARACTER = 'Input contains invalid character';
exports.INCORRECT_NUMBER_OF_IMAGES = 'At least 1 and a maximum of 7 image must be uploaded'
exports.VEHICLE_DOES_NOT_EXIST = 'Vehicle does\'t exists';
exports.VEHICLE_PHOTOS_UPLOADED = 'File(s) uploaded successfully';
exports.VEHICLE_PHOTOS_UPLOAD_FAIL = 'File(s) failed to upload';
exports.VEHICLE_CREATED_SUCCESSFULLY = 'Successfully created vehicle';
exports.VEHICLE_UPDATED_SUCCESSFULLY = 'Vehicle successfully updated';
exports.REACHED_MAXIMUM_VEHICLE_PHOTOS = 'Maximum number of photos reached, please delete one, before uploading a new photo';
exports.MAXIMUM_VEHICLE_PHOTOS = 'Maximum of 7 photos can be uploaded';
exports.DELETE_VEHICLE_SUCCESSFULLY = 'Vehicle has been deleted successfully';
exports.DELETE_AT_LEAST_ONE_IMAGE = 'At least one image must be specified';
exports.DELETE_IMAGE_FAIL = 'Failed to delete image(s)';
exports.MUST_UPLOAD_AT_LEAST_ONE = 'Must upload at least one image for vehicle';
exports.INCORRECT_VEHICLE_PHOTOS = 'At least one vehicle photo must be uploaded and at most seven'

exports.CLOUDINARY_UPLOAD_FAIL = 'Failed to upload to cloudinary';
exports.CLOUDINARY_DELETE_VEHICLE_FAIL = 'Failed to delete vehicle from cloudinary';

exports.HOUR_LENGTH_MAX = 4;
exports.MIN_LENGTH = 0;
exports.FROM = 0;
exports.TO = 1;
exports.SUNDAY = 'Sunday';
exports.MONDAY = 'Monday';
exports.TUESDAY = 'Tuesday';
exports.WEDNESDAY = 'Wednesday';
exports.THURSDAY = 'Thursday';
exports.FRIDAY = 'Friday';
exports.SATURDAY = 'Saturday';
exports.PHONE_LENGTH_MAX = 20;
exports.ADDRESS_LENGTH_MAX = 70;
exports.DEALERSHIP_NAME_LENGTH_MAX = 50;
exports.MAX_VEHICLE_PHOTOS = 7;
exports.TIER_ONE = '1';
exports.TIER_ONE_MAX = 5;

exports.BASIC_INFO = 'basicInfo';
exports.MAKE = { name: 'Make', max: 15 };
exports.MODEL = { name: 'Model', max: 15 };
exports.TRIM = { name: 'Trim', max: 10 };
exports.TYPE = { name: 'Type', max: 20 };
exports.YEAR = { name: 'Year', max: 4 };
exports.EXTERIOR_COLOUR = { name: 'Exterior Colour', max: 15 };
exports.INTERIOR_COLOUR = { name: 'Interior Colour', max: 15 };
exports.PRICE = { name: 'Price', max: 10 };
exports.KILOMETRES = { name: 'Kilometres', max: 8 };
exports.FUEL_TYPE = { name: 'Fuel Type', max: 20 };
exports.DOORS = { name:  'Doors', max: 2 };
exports.SEATS = { name: 'Seats', max: 2 };
exports.DESCRIPTION = { name: 'Description', max: 300 };
exports.CAR_PROOF = { name: 'CarProof' };
exports.TRANSMISSION = { name: 'Transmission', max:  20};
exports.ENGINE_SIZE = { name: 'Engine Size (L)', max: 6 };
exports.CYLINDERS = { name: 'Cylinders', max: 2 };
exports.HORSEPOWER = { name: 'Horsepower @ RPM', max: 6 };
exports.TORQUE = { name: 'Torque (lb - ft) @ RPM', max: 6 };
exports.RECOMMENDED_FUEL = { name: 'Recommended Fuel', max: 20 };
exports.FUEL_CITY = { name: 'City (L/100Km)', max: 6 };
exports.FUEL_HIGHWAY = { name: 'Highway (L/100Km)', max: 6 };
exports.FUEL_COMBINED = { name: 'Combined (L/100Km)', max: 6 };

exports.VEHICLE_FEATURES_IS_ARRAY = 'array';
exports.VEHICLE_FEATURES = { name: 'VehicleFeatures' };
exports.DEFAULT = '<default>';
exports.OKAY = 'ok';

exports.MECHANICAL_SPECS = 'mechanicalSpecs';
exports.FUEL_ECONOMY = 'fuelEconomy';

exports.DEVELOPMENT = 'development';
exports.DEVELOPMENT_CLOUDINARY = 'development-cloudinary';

exports.PRODUCTION = 'production';

exports.TESTING = 'testing';


exports.isLengthCorrect = (checkText, minLength, maxLength) => {
  if ((checkText.trim().length <= minLength) || (checkText.trim().length > maxLength)) {
    return false;
  } else {
    return true;
  }
}

exports.isArrayLengthCorrect = (checkArray, minLength, maxLength) => {
  if ((checkArray.length <= minLength) || (checkArray.length > maxLength)) {
    return false;
  } else {
    return true;
  }
}

exports.isLengthExact = (checkText, exactLength) => {
  if (checkText.trim().length === exactLength) {
    return true;
  } else {
    return false;
  }
}

exports.lengthTooLong = (text) => {
  return `length of ${text} is too long`;
}

exports.followingLengthsTooLong = (textArray) => {
  var tooLong = [];

  for (index in textArray) {
    tooLong.push(textArray[index]);
  }

  return { 'values exceeding maximum length': tooLong };
}

exports.containsInvalidMongoCharacter = (value) => {
  for (var key in value) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      if (value[key].constructor === Array) {
        for (index in value[key]) {
          if (validator.contains(value[key][index], '$')) {
            return true;
          }
        }
      } else if (value[key]) {
        if (validator.contains(value[key], '$')) {
          return true;
        }
      }
    }
  }

  return false;
}

exports.deleteFiles = (files) => {
  for (var i = 0; i < files.length; i++) {
    fs.unlinkSync(files[i].path);
  }
}
