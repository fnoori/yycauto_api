const mongoose = require('mongoose');
const UserModel = require('../models/user');
const ErrorModel = require('../models/error');

const errorUtils = require('../utils/errorUtils');
const excludedParams = '-_id -__v';

exports.get_all_dealerships = (req, res, next) => {
  UserModel.find()
  .select(excludedParams).exec()
  .then(users => {
    res.status(201).json(users);
  }).catch(findErr => {
    errorUtils.storeError(500, findErr);
    return res.status(500).json(errorUtils.error_500('mongoose.find() failed'));
  });
}
