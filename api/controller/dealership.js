const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Vehicle = require('../model/vehicle');
const Dealership = require('../model/dealership');

const rootTempVehicleDir = 'uploads/tmp/vehicles/';
const messages = require('../utils/messages');

const omitFromFind = '-password -__v -_id -permission';

exports.getAllDealerships = (req, res, next) => {
  const perPage = parseInt(req.params.perPage);
  const lazyLoad = parseInt(req.params.lazyLoad);

  Dealership.find()
    .select(omitFromFind)
    .where('permission').nin(['1'])
    .skip(lazyLoad).limit(perPage).exec().then(docs => {
      res.status(200).send(docs);
    }).catch(dealershipFindErr => {
      return res.status(500).send({
        'Error': dealershipFindErr.message
      });
    });
};

exports.createDealership = (req, res, next) => {

};

exports.createAdmin = (req, res, next) => {
  if (req.params.key !== process.env.ADMIN_KEY) {
    return res.status(403).send({'403 -- ERROR': messages.UNAUTHORIZED_ACTION});
  }

  bcrypt.hash(req.body.password, 10).then(hash => {
    const admin = new Dealership({
      _id: new mongoose.Types.ObjectId(),
      name: 'admin',
      email: req.body.email,
      password: hash,
      phone: 'admin',
      address: 'admin',
      permission: '1'
    });

    admin.save().then(() => {
      res.status(200).send('Admin account created successfully');
    }).catch(adminSaveErr => {
      return res.status(500).send({
        'adminSave Error': adminSaveErr.message
      });
    });
  }).catch(bcryptHashErr => {
    return res.status(500).send({
      'bcrypt Error': bcryptHashErr.message
    });
  });
};