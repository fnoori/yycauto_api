const HOUR_LENGTH = 4;
const MIN_LENGTH = 0;
const FROM = 0;
const TO = 1;
const SUNDAY = 'Sunday';
const MONDAY = 'Monday';
const TUESDAY = 'Tuesday';
const WEDNESDAY = 'Wednesday';
const THURSDAY = 'Thursday';
const FRIDAY = 'Friday';
const SATURDAY = 'Saturday';

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
    return res.status(500).json(errorUtils.error_message(utils.MONGOOSE_FIND_FAIL, 500));
  });
}

exports.get_dealership_by_id = (req, res, next) => {
  if (!validator.isMongoId(req.body.id)) {
    return res.status(400).json(errorUtils.error_message(utils.MONGOOSE_INCORRECT_ID, 400));
  }

  UserModel.findById(req.body.id)
  .select(excludedParams)
  .then(user => {
    res.status(201).json(user);
  }).catch(findErr => {
    errorUtils.storeError(500, findErr);
    return res.status(500).json(errorUtils.error_message(utils.MONGOOSE_FIND_BY_ID_FAIL, 500));
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
    return res.status(400).json(errorUtils.error_message(utils.MONGOOSE_INCORRECT_ID, 400));
  }
  if (preCheck_phone !== undefined && !validator.isMobilePhone(preCheck_phone)) {
    return res.status(400).json(errorUtils.error_message(utils.INCORRECT_PHONE_FORMAT, 400));
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
    return res.status(400).json(errorUtils.error_message(utils.AT_LEAST_ONE_FIELD_REQUIRED, 400));
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
          res.status(201).json({message: utils.MONGOOSE_SUCCESSFUL_UPDATE});
        }).catch(updateErr => {
          errorUtils.storeError(500, updateErr);
          return res.status(500).json(errorUtils.error_message(utils.MONGOOSE_FIND_ONE_FAIL, 500));
        });

      } else {
        return res.status(401).json(errorUtils.error_message(utils.UNAUTHORIZED_ACCESS, 401));
      }
    } else {
      return res.status(404).json(errorUtils.error_message(utils.USER_DOES_NOT_EXIST, 404));
    }
  }).catch(findErr => {
    errorUtils.storeError(500, findErr);
    return res.status(500).json(errorUtils.error_message(utils.MONGOOSE_FIND_ONE_FAIL, 500));
  });
}

exports.update_dealership_hours = (req, res, next) => {
  var auth0Id = '';
  var id = '';
  var updateData = {};

  if (!validator.isMongoId(req.body.id)) {
    return res.status(400).json(errorUtils.error_message(utils.MONGOOSE_INCORRECT_ID, 400));
  }

  const sunday = _.isUndefined(mongoSanitize(req.body.sundayHours)) ? { day: SUNDAY } : { day: SUNDAY, hours: mongoSanitize(req.body.sundayHours)};
  const monday = _.isUndefined(mongoSanitize(req.body.mondayHours)) ? { day: MONDAY } : { day: MONDAY, hours: mongoSanitize(req.body.mondayHours) };
  const tuesday = _.isUndefined(mongoSanitize(req.body.tuesdayHours)) ? { day: TUESDAY } : { day: TUESDAY, hours: mongoSanitize(req.body.tuesdayHours) };
  const wednesday = _.isUndefined(mongoSanitize(req.body.wednesdayHours)) ? { day: WEDNESDAY } : { day: WEDNESDAY, hours: mongoSanitize(req.body.wednesdayHours) };
  const thursday = _.isUndefined(mongoSanitize(req.body.thursdayHours)) ? { day: THURSDAY } : { day: THURSDAY, hours: mongoSanitize(req.body.thursdayHours) };
  const friday = _.isUndefined(mongoSanitize(req.body.fridayHours)) ? { day: FRIDAY } : { day: FRIDAY, hours: mongoSanitize(req.body.fridayHours) };
  const saturday = _.isUndefined(mongoSanitize(req.body.saturdayHours)) ? { day: SATURDAY } : { day: SATURDAY, hours: mongoSanitize(req.body.saturdayHours) };
  const days = [sunday, monday, tuesday, wednesday, thursday, friday, saturday];

  for (day in days) {
    // only if times are being changed for the day
    if (!_.isUndefined(days[day].hours)) {
      var from = days[day].hours.split('-')[0];
      var to = days[day].hours.split('-')[1];

      if (!utils.isLengthExact(from, HOUR_LENGTH) ||
          !utils.isLengthExact(to, HOUR_LENGTH)) {
            return res.status(400).json(errorUtils.error_message(utils.USE_24_HOUR_FORMAT, 400));
          }
      if (!validator.isInt(from) ||
          !validator.isInt(to)) {
            return res.status(400).json(errorUtils.error_message(utils.TIME_MUST_BE_NUMBERS, 400));
          }

      updateData['dealership_hours.' + days[day].day + '.from'] = from;
      updateData['dealership_hours.' + days[day].day + '.to'] = to;
    }
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
          res.status(201).json({message: utils.MONGOOSE_SUCCESSFUL_UPDATE});
        }).catch(updateErr => {
          errorUtils.storeError(500, updateErr);
          return res.status(500).json(errorUtils.error_message(utils.MONGOOSE_FIND_ONE_FAIL, 500));
        });

      } else {
        return res.status(401).json(errorUtils.error_message(utils.UNAUTHORIZED_ACCESS, 401));
      }
    } else {
      return res.status(404).json(errorUtils.error_message(utils.USER_DOES_NOT_EXIST, 404));
    }


  }).catch(findOneErr => {
    errorUtils.storeError(500, findErr);
    return res.status(500).json(errorUtils.error_message(utils.MONGOOSE_FIND_ONE_FAIL, 500));
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
