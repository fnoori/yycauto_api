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
  var auth0Id = '';
  var userId = '';
  var updateData = {};

  if (!validator.isMongoId(req.body.id)) {
    return res.status(400).json(errorUtils.error_message(utils.MONGOOSE_INCORRECT_ID, 400));
  }

  // extract data being updated, otherwise assign empty string
  const phone = _.isUndefined(mongoSanitize(req.body.phone)) ? '' : mongoSanitize(req.body.phone);
  const address = _.isUndefined(mongoSanitize(req.body.address)) ? '' : mongoSanitize(req.body.address);
  const dealershipName = _.isUndefined(mongoSanitize(req.body.dealership_name)) ? '' : mongoSanitize(req.body.dealership_name);

  // validate data and check which fields are being updated
  if (phone.length > 0) {
    if (!utils.isLengthCorrect(phone, utils.MIN_LENGTH, utils.PHONE_LENGTH_MAX) || !validator.isMobilePhone(phone)) {
      return res.status(400).json(errorUtils.error_message(utils.INCORRECT_PHONE_FORMAT));
    } else {
      updateData.phone = phone;
    }
  }
  if (address.length > 0) {
    if (!utils.isLengthCorrect(address, utils.MIN_LENGTH, utils.ADDRESS_LENGTH_MAX)) {
      return res.status(400).json(errorUtils.error_message(utils.ADDRESS_INCORRECT_LENGTH));
    } else {
      updateData.address = address;
    }
  }
  if (dealershipName.length > 0) {
    if (!utils.isLengthCorrect(dealershipName, utils.MIN_LENGTH, utils.DEALERSHIP_NAME_LENGTH_MAX)) {
      return res.status(400).json(errorUtils.error_message(utils.DEALERSHIP_NAME_INCORRECT_LENGTH));
    } else {
      updateData.dealership_name = dealershipName;
    }
  }

  // check to make sure at least one thing is being updated
  if (_.isEmpty(updateData)) {
    return res.status(400).json(errorUtils.error_message(utils.AT_LEAST_ONE_FIELD_REQUIRED, 400));
  }

  // assign auth0_id and id
  auth0Id = req.user.sub.split('|')[1];
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

  // extract data being updated, otherwise assign empty string
  const sunday = _.isUndefined(mongoSanitize(req.body.sundayHours)) ? { day: utils.SUNDAY } : { day: utils.SUNDAY, hours: mongoSanitize(req.body.sundayHours)};
  const monday = _.isUndefined(mongoSanitize(req.body.mondayHours)) ? { day: utils.MONDAY } : { day: utils.MONDAY, hours: mongoSanitize(req.body.mondayHours) };
  const tuesday = _.isUndefined(mongoSanitize(req.body.tuesdayHours)) ? { day: utils.TUESDAY } : { day: utils.TUESDAY, hours: mongoSanitize(req.body.tuesdayHours) };
  const wednesday = _.isUndefined(mongoSanitize(req.body.wednesdayHours)) ? { day: utils.WEDNESDAY } : { day: utils.WEDNESDAY, hours: mongoSanitize(req.body.wednesdayHours) };
  const thursday = _.isUndefined(mongoSanitize(req.body.thursdayHours)) ? { day: utils.THURSDAY } : { day: utils.THURSDAY, hours: mongoSanitize(req.body.thursdayHours) };
  const friday = _.isUndefined(mongoSanitize(req.body.fridayHours)) ? { day: utils.FRIDAY } : { day: utils.FRIDAY, hours: mongoSanitize(req.body.fridayHours) };
  const saturday = _.isUndefined(mongoSanitize(req.body.saturdayHours)) ? { day: utils.SATURDAY } : { day: utils.SATURDAY, hours: mongoSanitize(req.body.saturdayHours) };
  const days = [sunday, monday, tuesday, wednesday, thursday, friday, saturday];

  // loop through days and check which ones are actually being updated
  for (day in days) {
    if (!_.isUndefined(days[day].hours)) {
      var from = days[day].hours.split('-')[0];
      var to = days[day].hours.split('-')[1];

      if (!utils.isLengthExact(from, utils.HOUR_LENGTH_MAX) ||
          !utils.isLengthExact(to, utils.HOUR_LENGTH_MAX)) {
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

  auth0Id = req.user.sub.split('|')[1];
  userId = req.body.id;

  // after sanitizing data and checking for existance of data, begin update process
  UserModel.findOne({ auth0_id: auth0Id })
  .exec()
  .then(user => {
    if (user) {
      // after finding, check if the provided id matches the one from db
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
    errorUtils.storeError(500, findOneErr);
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
