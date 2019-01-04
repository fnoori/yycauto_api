const mongoose = require('mongoose');
const ErrorModel = require('../models/error');

exports.storeError = (error_code, error_message) => {
  const newError = new ErrorModel({
    _id: new mongoose.Types.ObjectId(),
    error_code: error_code,
    error_message: error_message,
    date_time: new Date()
  });

  newError.save()
  .then(saved => {
    // do nothing
  }).catch(saveErr => {
    console.log('storeError -- mongoose.save() failed');
  });
}

exports.error_message = (message, error_code) => {
  return {
    message: message,
    error_code: error_code
  };
}
