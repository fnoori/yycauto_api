const _ = require('underscore');

exports.MONGOOSE_FIND_FAIL = 'mongoose.find() failed';
exports.MONGOOSE_INCORRECT_ID = 'Incorrect id format';
exports.MONGOOSE_FIND_BY_ID_FAIL = 'mongoose.findById() failed';
exports.MONGOOSE_FIND_ONE_FAIL = 'mongoose.updateOne() failed';
exports.MONGOOSE_SUCCESSFUL_UPDATE = 'Successfully updated';

exports.INCORRECT_PHONE_FORMAT = 'Incorrect phone number format';
exports.AT_LEAST_ONE_FIELD_REQUIRED = 'At least one field must be provided to update';
exports.UNAUTHORIZED_ACCESS = 'unauthorized access';
exports.USER_DOES_NOT_EXIST = 'User doesn\'t exist';
exports.USE_24_HOUR_FORMAT = 'Must use 24 hour time format';
exports.TIME_MUST_BE_NUMBERS = 'Times must be numbers';


exports.isLengthCorrect = (checkText, minLength, maxLength) => {
  if ((checkText.trim().length <= minLength) || (checkText.length > maxLength)) {
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
