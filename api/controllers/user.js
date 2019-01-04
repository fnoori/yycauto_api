const mongoose = require('mongoose');
const UserModel = require('../models/user');
const ErrorModel = require('../models/error');

const utils = require('../../utils');
const excludedParams = '-_id -__v';

exports.get_all_dealerships = (req, res, next) => {
  UserModel.find()
  .select(excludedParams).exec()
  .then(users => {
    res.status(201).json(users);
  }).catch(findErr => {
    storeError(500, findErr);
    return res.status(500).json(utils.error_500('mongoose.find() failed'));
  });
}

storeError = (error_code, error_message) => {
  const newError = new ErrorModel({
    _id: new mongoose.Types.ObjectId(),
    error_code: error_code,
    error_message: error_message
  });

  newError.save()
  .then(saved => {
    // do nothing
  }).catch(saveErr => {
    console.log('storeError -- mongoose.save() failed');
  });
}
