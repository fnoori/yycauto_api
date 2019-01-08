const _ = require('underscore');
const validator = require('validator');

exports.MONGOOSE_FIND_FAIL = 'mongoose.find() failed';
exports.MONGOOSE_INCORRECT_ID = 'Incorrect id format';
exports.MONGOOSE_FIND_BY_ID_FAIL = 'mongoose.findById() failed';
exports.MONGOOSE_FIND_ONE_FAIL = 'mongoose.findOne() failed';
exports.MONGOOSE_SUCCESSFUL_UPDATE = 'Successfully updated';
exports.MONGOOSE_SAVE_FAIL = 'mongoose.save() failed';

exports.INCORRECT_PHONE_FORMAT = 'Incorrect phone number format';
exports.AT_LEAST_ONE_FIELD_REQUIRED = 'At least one field must be provided to update';
exports.UNAUTHORIZED_ACCESS = 'unauthorized access';
exports.USER_DOES_NOT_EXIST = 'User doesn\'t exist';
exports.USE_24_HOUR_FORMAT = 'Must use 24 hour time format';
exports.TIME_MUST_BE_NUMBERS = 'Times must be numbers';
exports.ADDRESS_INCORRECT_LENGTH = 'Incorrect address length';
exports.DEALERSHIP_NAME_INCORRECT_LENGTH = 'Incorrect dealership name length';
exports.CONTAINS_INVALID_CHARACTER = 'Input contains invalid character';

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

exports.MAKE = 'make';
exports.MODEL = 'model';
exports.TRIM = 'trim';
exports.MAKE_MAX_LENGTH = 15;
exports.MODEL_MAX_LENGTH = 15;
exports.TRIM_MAX_LENGTH = 10;
exports.DEFAULT = '<default>';


exports.isLengthCorrect = (checkText, minLength, maxLength) => {
  console.log(`${checkText} length: ${checkText.trim().length}`);
  if ((checkText.trim().length <= minLength) || (checkText.trim().length > maxLength)) {
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
