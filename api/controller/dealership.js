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
        'dealershipFindErr Error': dealershipFindErr.message
      });
    });
};

exports.createDealership = (req, res, next) => {
  console.log(req.body);
  return;

  if (req.params.key !== process.env.ADMIN_KEY) {
    return res.status(403).send({'403 -- ERROR': messages.UNAUTHORIZED_ACTION});
  }

  Dealership.find({
    $or: [
      { email: req.params.email },
      { name: req.params.name}
    ]
  }).then(dealershipFindRes => {
    if (dealershipFindRes.length >= 1) {
      return res.status(409).send({'409 -- Error': messages.DEALERSHIP_ALREADY_EXISTS});
    }
  
    bcrypt.hash(req.body.password, 10).then(hash => {

      const newDealreship = new Dealership({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        email: req.body.email,
        password: hash,
        phone: req.body.phone,
        phone_other: req.body.phone_other,
        address: req.body.address,
        permission: '2',
        date: {
          created: Date.now(),
          modified: Date.now()
        }
      });

      newDealreship.save().then(() => {
        res.status(200).send(messages.DEALERSHIP_CREATED);
      }).catch(newDealershipSaveErr => {
        return res.status(500).send({
          'newDealershipSaveErr': newDealershipSaveErr
        });
      });
    }).catch(bcryptHashErr => {
      return res.status(500).send({
        'bcryptHashErr': bcryptHashErr
      });
    });
  }).catch(findErr => {
    return res.status(500).send({
      'findErr': findErr
    });
  });
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
      permission: '1',
      date: {
        created: Date.now(),
        modified: Date.now()
      }
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