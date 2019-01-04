const mongoose = require('mongoose');
const validator = require('validator');

const UserModel = require('../models/user');
const ErrorModel = require('../models/error');
const mongoSanitize = require('mongo-sanitize');

const errorUtils = require('../utils/errorUtils');
const excludedParams = '-_id -__v';

exports.get_all_dealerships = (req, res, next) => {
  UserModel.find()
  .select(excludedParams).exec()
  .then(users => {
    res.status(201).json(users);
  }).catch(findErr => {
    errorUtils.storeError(500, findErr);
    return res.status(500).json(errorUtils.error_message('mongoose.find() failed', 500));
  });
}

exports.update_dealership = (req, res, next) => {
  const preCheck_phone = mongoSanitize(req.body.phone);
  const preCheck_address = mongoSanitize(req.body.address);
  const preCheck_dealershipName = mongoSanitize(req.body.dealership_name);
  var updateData = {}

  if (!validator.isMobilePhone(preCheck_phone)) {
    return res.status(400).json(errorUtils.error_message('Incorrect phone number format', 400));
  }

  // after sanitizing data for mongodb, check if there is data to update
  if (preCheck_phone !== undefined && preCheck_phone.length > 0) {
    updateData.phone = preCheck_phone;
  }
  if (preCheck_address !== undefined && preCheck_address.length > 0) {
    updateData.address = preCheck_address;
  }
  if (preCheck_dealershipName !== undefined && preCheck_dealershipName.length > 0) {
    updateData.dealershipName = preCheck_email;
  }

  UserModel.findOne({ auth0_id: req.body.auth0_id })
  .exec()
  .then(user => {
    if (user) {
      if (req.body.id === String(user._id)) {

        // user found, now update
        UserModel.updateOne({ _id: user._id }, updateData)
        .exec()
        .then(update =>  {
          res.status(201).json({message: 'Successfully updated'});
        }).catch(updateErr => {
          errorUtils.storeError(500, updateErr);
          return res.status(500).json(errorUtils.error_message('mongoose.update() failed', 500));
        });

      } else {
        return res.status(401).json(errorUtils.error_message('Unauthorized access', 401));
      }
    } else {
      return res.status(404).json(errorUtils.error_message('User doesn\'t exist', 404));
    }
  }).catch(findErr => {
    errorUtils.storeError(500, findErr);
    return res.status(500).json(errorUtils.error_message('mongoose.find() failed', 500));
  });
}


// the following method is created for testing purposes
exports.get_my_dealership = (req, res, next) => {
  UserModel.findOne({ auth0_id: req.body.auth0_id })
  .exec()
  .then(user => {

    if (user.length > 0) {
      if (req.body.id === String(user[0]._id)) {
        res.status(201).json({
          message: 'found user'
        });
      } else {
        return res.status(401).json(errorUtils.error_message('Unauthorized access', 401));
      }
    } else {
      return res.status(404).json(errorUtils.error_message('User doesn\'t exist', 404));
    }

  }).catch(findErr => {
    errorUtils.storeError(500, findErr);
    return res.status(500).json(errorUtils.error_message('mongoose.find() failed', 500));
  });
}
