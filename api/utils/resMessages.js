const mongoose = require('mongoose');
const Error = require('../models/error');

exports.INVALID_EMAIL = 'Invalid email address';
exports.PROVIDE_DEALERSHIP_NAME = 'Must provide dealership name';
exports.PROVIDE_PHONE_NUMBER = 'Must provide phone number';
exports.PROVIDE_ADDRESS = 'Must provide address';
exports.DEALERSHIP_NOT_FOUND_WITH_ID = 'No dealership found with provided ID';
exports.DEALERSHIP_ID_TOKEN_NOT_MATCH = 'Dealership ID from token and provided dealership ID do not match';
exports.OLD_PASSWORD_INCORRECT = 'Old password is incorrect';
exports.AUTHENTICATION_FAIL = 'Authentication failed';
exports.UPDATE_PHONE_INVALID = 'If updating phone number, please provide a phone number';
exports.UPDATE_ADDRESS_INVALID = 'If updating an address, please provide an address';
exports.DEALERSHIP_UPDATED = 'Dealership successfully update';
exports.DEALERSHIP_NOT_FOUND_WITH_NAME = 'No dealership found with matching name';
exports.ADMIN_CREATED = 'Admin account created';
exports.VEHICLE_UPDATED = 'Vehicle successfully updated';
exports.FIELD_CANNOT_BE_EMPTY = 'Field cannot be empty';

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
