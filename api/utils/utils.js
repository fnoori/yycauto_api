const _ = require('underscore');
const validator = require('validator');

exports.MONGOOSE_FIND_FAIL = 'mongoose.find() failed';
exports.MONGOOSE_INCORRECT_ID = 'Incorrect id format';
exports.MONGOOSE_FIND_BY_ID_FAIL = 'mongoose.findById() failed';
exports.MONGOOSE_FIND_ONE_FAIL = 'mongoose.findOne() failed';
exports.MONGOOSE_SUCCESSFUL_UPDATE = 'Successfully updated';
exports.MONGOOSE_SAVE_FAIL = 'mongoose.save() failed';
exports.MONGOOSE_UPDATE_ONE_FAIL = 'mongoose.updateOne() failed';
exports.MONGOOSE_FIND_ONE_AND_UPDATE_FAIL = 'mongoose.findOneAndUpdate() failed';
exports.MONGOOSE_POPULATE_FAIL = 'mongoose.populate() failed';

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

exports.MAKE = 'make';
exports.MODEL = 'model';
exports.TRIM = 'trim';
exports.MAKE_MAX_LENGTH = 15;
exports.MODEL_MAX_LENGTH = 15;
exports.TRIM_MAX_LENGTH = 10;
exports.DEFAULT = '<default>';


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

exports.containsInvalidMongoCharacter = (value) => {
  for (var key in value) {
    if (value.hasOwnProperty(key)) {
      if (value[key].constructor === Array) {
        for (index in value[key]) {
          if (validator.contains(value[key][index], '$')) {
            return true;
          }
        }
      } else if (validator.contains(value[key], '$')) {
        return true;
      }
    }
  }

  return false;
}
