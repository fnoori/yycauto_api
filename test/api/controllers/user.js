const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('underscore');
const fs = require('fs');

const UserModel = require('../models/user');
const ErrorModel = require('../models/error');
const mongoSanitize = require('mongo-sanitize');

const errorUtils = require('../utils/errorUtils');
const utils = require('../utils/utils');
const excludedParams = '-_id -__v -auth0_id';
var cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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
exports.update_dealership = async (req, res, next) => {
  var auth0Id = '';
  var userId = '';
  var updateData = {};
  var includesLogo = false;

  if (req.file) {
    includesLogo = true;
  }

  if (!validator.isMongoId(req.body.id)) {
    if (includesLogo) {
      deleteFile(req.body.id, req.file);
    }
    return res.status(400).json(errorUtils.error_message(utils.MONGOOSE_INCORRECT_ID, 400));
  }

  // extract data being updated, otherwise assign empty string
  const phone = _.isUndefined(mongoSanitize(req.body.phone)) ? '' : mongoSanitize(req.body.phone);
  const address = _.isUndefined(mongoSanitize(req.body.address)) ? '' : mongoSanitize(req.body.address);
  const dealershipName = _.isUndefined(mongoSanitize(req.body.dealership_name)) ? '' : mongoSanitize(req.body.dealership_name);

  // validate data and check which fields are being updated
  if (phone.length > 0) {
    if (includesLogo) {
      deleteFile(req.body.id, req.file);
    }
    if (!utils.isLengthCorrect(phone, utils.MIN_LENGTH, utils.PHONE_LENGTH_MAX) || !validator.isMobilePhone(phone)) {
      return res.status(400).json(errorUtils.error_message(utils.INCORRECT_PHONE_FORMAT));
    } else {
      updateData.phone = phone;
    }
  }
  if (address.length > 0) {
    if (includesLogo) {
      deleteFile(req.body.id, req.file);
    }
    if (!utils.isLengthCorrect(address, utils.MIN_LENGTH, utils.ADDRESS_LENGTH_MAX)) {
      return res.status(400).json(errorUtils.error_message(utils.ADDRESS_INCORRECT_LENGTH));
    } else {
      updateData.address = address;
    }
  }
  if (dealershipName.length > 0) {
    if (includesLogo) {
      deleteFile(req.body.id, req.file);
    }
    if (!utils.isLengthCorrect(dealershipName, utils.MIN_LENGTH, utils.DEALERSHIP_NAME_LENGTH_MAX)) {
      return res.status(400).json(errorUtils.error_message(utils.DEALERSHIP_NAME_INCORRECT_LENGTH));
    } else {
      updateData.dealership_name = dealershipName;
    }
  }

  // check to make sure at least one thing is being updated
  if (_.isEmpty(updateData) && !includesLogo) {
    if (includesLogo) {
      deleteFile(req.body.id, req.file);
    }
    return res.status(400).json(errorUtils.error_message(utils.AT_LEAST_ONE_FIELD_REQUIRED, 400));
  }

  updateData['date.modified'] = new Date();

  // assign auth0_id and id
  auth0Id = auth0Id = eval(process.env.AUTH0_ID_SOURCE);
  userId = req.body.id;

  var user;
  var updated;
  try {
    user = await UserModel.findOne({ auth0_id: auth0Id });

    if (!user) {
      if (includesLogo) {
        deleteFile(req.body.id, req.file);
      }
      return res.status(404).json(errorUtils.error_message(utils.USER_DOES_NOT_EXIST, 404));
    }
    if (!validator.equals(String(user._id), userId)) {
      if (includesLogo) {
        deleteFile(req.body.id, req.file);
      }
      return res.status(404).json(errorUtils.error_message(utils.UNAUTHORIZED_ACCESS, 404));
    }

    updated = await UserModel.updateOne({ _id: user._id }, updateData);
    if (!updated) {
      if (includesLogo) {
        deleteFile(req.body.id, req.file);
      }
      errorUtils.storeError(500, utils.MONGOOSE_UPDATE_ONE_FAIL);
      return res.status(500).json(errorUtils.error_message(utils.MONGOOSE_UPDATE_ONE_FAIL, 500));
    }

    if (includesLogo) {
      deleteFile(req.body.id, req.file);
    }

    res.status(201).json({ message: utils.MONGOOSE_SUCCESSFUL_UPDATE });

  } catch (e) {
    if (includesLogo) {
      deleteFile(req.body.id, req.file);
    }
    errorUtils.storeError(500, e.message);
    return res.status(500).json({error: e.message});
  }
}

exports.update_dealership_hours = async (req, res, next) => {
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

  updateData['date.modified'] = new Date();

  auth0Id = auth0Id = eval(process.env.AUTH0_ID_SOURCE);
  userId = req.body.id;

  var user;
  var updated;
  try {
    user = await UserModel.findOne({ auth0_id: auth0Id });

    if (!user) {
      return res.status(404).json(errorUtils.error_message(utils.USER_DOES_NOT_EXIST, 404));
    }
    if (!validator.equals(String(user._id), userId)) {
      return res.status(404).json(errorUtils.error_message(utils.UNAUTHORIZED_ACCESS, 404));
    }

    updated = await UserModel.updateOne({ _id: user._id }, updateData);
    if (!updated) {
      errorUtils.storeError(500, utils.MONGOOSE_FIND_ONE_FAIL);
      return res.status(500).json(errorUtils.error_message(utils.MONGOOSE_FIND_ONE_FAIL, 500));
    }

    res.status(201).json({message: utils.MONGOOSE_SUCCESSFUL_UPDATE});

  } catch (e) {
    errorUtils.storeError(500, e.message);
    return res.status(500).json({error: e.message});
  }
}

/*
ENVIRONMENT_DEV
ENVIRONMENT_DEV_CLOUDINARY
ENVIRONMENT_PRODUCTION
*/
uploadFile = async (user, file) => {
  try {
    if (validator.equals(process.env.NODE_ENV, process.env.ENVIRONMENT_DEV)) {

      let fsMkdir = fs.mkdirSync(`./test/imagesUploaded/${user._id}`, { recursive: true });
      let fsRename = fs.renameSync(file.path, `./test/imagesUploaded/${user._id}/logo.${file.mimetype.split('/')[1]}`);

    } else if (validator.equals(process.env.NODE_ENV, process.env.ENVIRONMENT_DEV_CLOUDINARY)) {

      let renameCloudDev = await cloudinary.v2.uploader.rename(file.public_id, `test/users/${user._id}/logo.${file.format}`, { overwrite: true });
      if (!renameCloudDev) {
        errorUtils.storeError(500, utils.CLOUDINARY_UPLOAD_FAIL);
        deleteFile(user, file);
        return res.status(500).json(errorUtils.error_message(utils.CLOUDINARY_UPLOAD_FAIL, 500));
      }

    } else if (validator.equals(process.env.NODE_ENV, process.env.ENVIRONMENT_PRODUCTION)) {

      let renameProd = await cloudinary.v2.uploader.rename(req.file.public_id, `production/users/${user._id}/logo.${req.file.format}`, { overwrite: true });
      if (!renameProd) {
        errorUtils.storeError(500, utils.CLOUDINARY_UPLOAD_FAIL);
        deleteFile(user, file);
        return res.status(500).json(errorUtils.error_message(utils.CLOUDINARY_UPLOAD_FAIL, 500));
      }

    }
  } catch (e) {
    errorUtils.storeError(500, e.message);
    deleteFile(user, file);
    return { error: e.message };
  }
}

deleteFile = async (user, file) => {
  try {
    if (validator.equals(process.env.NODE_ENV, process.env.ENVIRONMENT_DEV)) {

      let fsRm = fs.unlinkSync(`uploads/${file.filename}`);

    } else if (validator.equals(process.env.NODE_ENV, process.env.ENVIRONMENT_DEV_CLOUDINARY)) {

      let cloudinaryDeleteDevCloud = await cloudinary.v2.uploader.destroy(file.public_id);

    } else if (validator.equals(process.env.NODE_ENV, process.env.ENVIRONMENT_PRODUCTION)) {

      let cloudinaryDeleteProd = await cloudinary.v2.uploader.destroy(file.public_id);

    }
  } catch (e) {
    errorUtils.storeError(500, e.message);
    return { error: e.message };
  }
}
