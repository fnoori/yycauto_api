const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Vehicle = require('../model/vehicle');
const Dealership = require('../model/dealership');

const rootTempVehicleDir = 'uploads/tmp/vehicles/';

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
  if (req.body.key !== process.env.ADMIN_KEY) {
    return res.status(500).send('You are unauthorized to perform this action.');
  }

  bcrypt.hash(req.body.password, 10, (bcryptHashErr, hash) => {
    if (bcryptHashErr) {
      return res.status(500).send({
        'bcrypt Error': bcryptHashErr.message
      });
    } else {
      const admin = new Dealership({
        name: 'admin',
        email: req.body.email,
        password: hash,
        phone: 'admin',
        address: 'admin',
        permission: '1'
      });

      admin.save().then(adminSaveRes => {
        res.status(200).send('Admin account created successfully');
      }).catch(adminSaveErr => {
        return res.status(500).send({
          'adminSave Error': adminSaveErr.message
        });
      });
    }
  });
};

/*
const dealershipSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true},
    phone: { type: String, required: true },
    address: { type: String, required: true },
    permission: { type: String, required: true }
});
*/