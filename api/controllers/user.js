const MAX_HOUR_LENGTH = 4;
const FROM = 0;
const TO = 1;

const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('underscore');

const UserModel = require('../models/user');
const ErrorModel = require('../models/error');
const mongoSanitize = require('mongo-sanitize');

const errorUtils = require('../utils/errorUtils');
const utils = require('../utils/utils');
const excludedParams = '-_id -__v -auth0_id';

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

exports.get_dealership_by_id = (req, res, next) => {
  if (!validator.isMongoId(req.body.id)) {
    return res.status(400).json(errorUtils.error_message('Incorrect id format', 400));
  }

  UserModel.findById(req.body.id)
  .select(excludedParams)
  .then(user => {
    res.status(201).json(user);
  }).catch(findErr => {
    errorUtils.storeError(500, findErr);
    return res.status(500).json(errorUtils.error_message('mongoose.findById() failed', 500));
  });
}

// users are only allowed to update: phone, address, and dealership name from this API
exports.update_dealership = (req, res, next) => {
  const preCheck_phone = mongoSanitize(req.body.phone);
  const preCheck_address = mongoSanitize(req.body.address);
  const preCheck_dealershipName = mongoSanitize(req.body.dealership_name);
  var auth0Id = '';
  var userId = '';
  var updateData = {};

  if (!validator.isMongoId(req.body.id)) {
    return res.status(400).json(errorUtils.error_message('Incorrect id format', 400));
  }
  if (preCheck_phone !== undefined && !validator.isMobilePhone(preCheck_phone)) {
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
    updateData.dealership_name = preCheck_dealershipName;
  }

  // check to make sure at least one thing is being updated
  if (_.isEmpty(updateData)) {
    return res.status(400).json(errorUtils.error_message('At least one field must be provided to update', 400));
  }

  // assign auth0_id and id
  auth0Id = req.body.auth0_id;
  userId = req.body.id;

  // after sanitizing data and checking for existance of data, begin update process
  UserModel.findOne({ auth0_id: auth0Id })
  .exec()
  .then(user => {
    if (user) {
      if (userId === String(user._id)) {

        // user found, now update
        UserModel.updateOne({ _id: user._id }, updateData)
        .exec()
        .then(update =>  {
          res.status(201).json({message: 'Successfully updated'});
        }).catch(updateErr => {
          errorUtils.storeError(500, updateErr);
          return res.status(500).json(errorUtils.error_message('mongoose.updateOne() failed', 500));
        });

      } else {
        return res.status(401).json(errorUtils.error_message('Unauthorized access', 401));
      }
    } else {
      return res.status(404).json(errorUtils.error_message('User doesn\'t exist', 404));
    }
  }).catch(findErr => {
    errorUtils.storeError(500, findErr);
    return res.status(500).json(errorUtils.error_message('mongoose.findOne() failed', 500));
  });
}

exports.update_dealership_hours = (req, res, next) => {
  var auth0Id = '';
  var id = '';
  var updateData = {};
  const sunday = _.isUndefined(mongoSanitize(req.body.sundayHours)) ? '' : mongoSanitize(req.body.sundayHours);
  const monday = _.isUndefined(mongoSanitize(req.body.mondayHours)) ? '' : mongoSanitize(req.body.mondayHours);
  const tuesday = _.isUndefined(mongoSanitize(req.body.tuesdayHours)) ? '' : mongoSanitize(req.body.tuesdayHours);
  const wednesday = _.isUndefined(mongoSanitize(req.body.wednesdayHours)) ? '' : mongoSanitize(req.body.wednesdayHours);
  const thursday = _.isUndefined(mongoSanitize(req.body.thursdayHours)) ? '' : mongoSanitize(req.body.thursdayHours);
  const friday = _.isUndefined(mongoSanitize(req.body.fridayHours)) ? '' : mongoSanitize(req.body.fridayHours);
  const saturday = _.isUndefined(mongoSanitize(req.body.saturdayHours)) ? '' : mongoSanitize(req.body.saturdayHours);
  const sundayFrom = sunday.split(' ')[FROM];
  const sundayTo = sunday.split(' ')[TO];
  const mondayFrom = monday.split(' ')[FROM];
  const mondayTo = monday.split(' ')[TO];
  const tuesdayFrom = tuesday.split(' ')[FROM];
  const tuesdayTo = tuesday.split(' ')[TO];
  const wednesdayFrom = wednesday.split(' ')[FROM];
  const wednesdayTo = wednesday.split(' ')[TO];
  const thursdayFrom = thursday.split(' ')[FROM];
  const thursdayTo = thursday.split(' ')[TO];
  const fridayFrom = friday.split(' ')[FROM];
  const fridayTo = friday.split(' ')[TO];
  const saturdayFrom = saturday.split(' ')[FROM];
  const saturdayTo = saturday.split(' ')[TO];

  // check if any of the lenghts are too long
  if (!utils.checkLength(sundayFrom, MAX_HOUR_LENGTH)    || !utils.checkLength(sundayTo, MAX_HOUR_LENGTH)   ||
      !utils.checkLength(mondayFrom, MAX_HOUR_LENGTH)    || !utils.checkLength(mondayTo, MAX_HOUR_LENGTH)   ||
      !utils.checkLength(tuesdayFrom, MAX_HOUR_LENGTH)   || !utils.checkLength(tuesdayTo, MAX_HOUR_LENGTH)  ||
      !utils.checkLength(wednesdayFrom, MAX_HOUR_LENGTH) || !utils.checkLength(wednesdayTo, MAX_HOUR_LENGTH)||
      !utils.checkLength(thursdayFrom, MAX_HOUR_LENGTH)  || !utils.checkLength(thursdayTo, MAX_HOUR_LENGTH) ||
      !utils.checkLength(fridayFrom, MAX_HOUR_LENGTH)    || !utils.checkLength(fridayTo, MAX_HOUR_LENGTH)   ||
      !utils.checkLength(saturdayFrom, MAX_HOUR_LENGTH)  || !utils.checkLength(saturdayTo, MAX_HOUR_LENGTH)) {
        return res.status(400).json(errorUtils.error_message('Incorrect length in hours', 400));
  }

  if (sunday.length > 0) {
    updateData['dealership_hours.Sunday.from'] = sundayFrom;
    updateData['dealership_hours.Sunday.to'] = sundayTo;
  }
  if (monday.length > 0) {
    updateData['dealership_hours.Monday.from'] = mondayFrom;
    updateData['dealership_hours.Monday.to'] = mondayTo;
  }
  if (tuesday.length > 0) {
    updateData['dealership_hours.Tuesday.from'] = tuesdayFrom;
    updateData['dealership_hours.Tuesday.to'] = tuesdayTo;
  }
  if (wednesday.length > 0) {
    updateData['dealership_hours.Wednesday.from'] = wednesdayFrom;
    updateData['dealership_hours.Wednesday.to'] = wednesdayTo;
  }
  if (thursday.length > 0) {
    updateData['dealership_hours.Thursday.from'] = thursdayFrom;
    updateData['dealership_hours.Thursday.to'] = thursdayTo;
  }
  if (friday.length > 0) {
    updateData['dealership_hours.Friday.from'] = fridayFrom;
    updateData['dealership_hours.Friday.to'] = fridayTo;
  }
  if (saturday.length > 0) {
    updateData['dealership_hours.Saturday.from'] = saturdayFrom;
    updateData['dealership_hours.Saturday.to'] = saturdayTo;
  }

  auth0Id = req.body.auth0_id;
  userId = req.body.id;

  // after sanitizing data and checking for existance of data, begin update process
  UserModel.findOne({ auth0_id: auth0Id })
  .exec()
  .then(user => {
    if (user) {
      if (userId === String(user._id)) {

        // user found, now update
        UserModel.updateOne({ _id: user._id }, updateData)
        .exec()
        .then(update =>  {
          res.status(201).json({message: 'Successfully updated'});
        }).catch(updateErr => {
          errorUtils.storeError(500, updateErr);
          return res.status(500).json(errorUtils.error_message('mongoose.updateOne() failed', 500));
        });

      } else {
        return res.status(401).json(errorUtils.error_message('Unauthorized access', 401));
      }
    } else {
      return res.status(404).json(errorUtils.error_message('User doesn\'t exist', 404));
    }


  }).catch(findOneErr => {
    errorUtils.storeError(500, findErr);
    return res.status(500).json(errorUtils.error_message('mongoose.findOne() failed', 500));
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
