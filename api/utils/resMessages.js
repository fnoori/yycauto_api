const mongoose = require('mongoose');
const Error = require('../models/error');

exports.AUTHENTICATION_SUCCESS = 'Authentication sccessful';

exports.ADMIN_CREATED = 'Admin account created';
exports.ADMIN_ONLY_CREATE_DEALERSHIP = 'Only admin users can create dealership accounts';

// dealership strings
exports.PROVIDE_DEALERSHIP_NAME = 'Must provide dealership name';
exports.DEALERSHIP_NOT_FOUND_WITH_ID = 'No dealership found with provided ID';
exports.DEALERSHIP_UPDATED = 'Dealership successfully update';
exports.DEALERSHIP_ID_TOKEN_NOT_MATCH = 'Dealership ID from token and provided dealership ID do not match';
exports.DEALERSHIP_NOT_FOUND_WITH_NAME = 'No dealership found with matching name';
exports.DEALERSHIP_CREATED = 'Dealership account created';
exports.DEALERSHIP_DELETED = 'Dealership deleted successfully';

// vehicle strings
exports.VEHICLE_UPDATED = 'Vehicle successfully updated';
exports.VEHICLE_NOT_FOUND_WITH_ID = 'No vehicle found with matching ID';
exports.MUST_INCLUDE_VEHICLE_PHOTOS = 'Must include photos of vehicle';
exports.VEHICLE_CREATED = 'Vehicle created';
exports.VEHICLE_DELETED_SUCCESSFULLY = 'Vehicle deleted sucessfully';
exports.VEHICLE_PICTURES_DELETED_SUCCESSFULLY = 'The chosen vehicle pictures have been deleted successfully';

// misc
exports.DEALERHSHIP_ALREADY_EXISTS = 'Account already exists for this dealership';
exports.INVALID_EMAIL = 'Invalid email address';
exports.OLD_PASSWORD_INCORRECT = 'Old password is incorrect';
exports.AUTHENTICATION_FAIL = 'Authentication failed';
exports.UPDATE_PHONE_INVALID = 'If updating phone number, please provide a phone number';
exports.UPDATE_ADDRESS_INVALID = 'If updating an address, please provide an address';
exports.FIELD_CANNOT_BE_EMPTY = 'Field cannot be empty';
exports.PROVIDE_PHONE_NUMBER = 'Must provide phone number';
exports.PROVIDE_ADDRESS = 'Must provide address';
exports.CANNOT_DELETE_DEALERSHIP = 'Incorrect permission to delete dealership account';
exports.MAX_IMAGES_REACHED_VEHICLE = 'Maximum of 7 files reached, please delete one and try uploading again';

// server error
exports.SERVER_DELETE_VEHICLE_ERROR = 'A server error occurred when trying to delete this vehicle';
exports.FAILED_TO_DELETE_TMP = 'Failed to delete temporary file(s)';

exports.INVALID_PASSWORD = [
    'Password must be at least 8 characters long',
    'Contain at least one uppercase character',
    'Contain at least one number'
];

exports.logError = (req, res, next) => {
    var dateTime = new Date();

    console.log(req);
    const error = new Error({
        _id: new mongoose.Types.ObjectId(),
        'Date': dateTime,
        'Error Message': req
    });
    error.save().then(result => {
        console.log(result);
    });
}

exports.resMessagesToReturn = (code, message, res) => {
    return res.status(code).json({
        message: message
    });
}
