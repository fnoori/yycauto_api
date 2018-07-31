const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Vehicle = require('../model/vehicle');
const Dealership = require('../model/dealership');

const rootTempVehicleDir = 'uploads/tmp/vehicles/';
const messages = require('../utils/messages');
const utils = require('../utils/utils');

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
  if (req.params.key !== process.env.ADMIN_KEY) {
    return res.status(403).send({ '403 -- ERROR': messages.UNAUTHORIZED_ACTION });
  }
  
  Dealership.findById(req.userData.dealershipId)
    .then(checkPermission => {
      if (Number(checkPermission.permission) !== 1) {
        return res.status(403).send({ '403 -- ERROR': messages.UNAUTHORIZED_ACTION });
      }

      Dealership.find({
        $or: [
          { email: req.body.email },
          { name: req.body.name }
        ]
      }).then(dealershipFindRes => {
        if (dealershipFindRes.length >= 1) {
          return res.status(409).send({ '409 -- Error': messages.DEALERSHIP_ALREADY_EXISTS });
        }

        bcryptjs.hash(req.body.password, 10).then(hash => {

          const newDealreship = new Dealership({
            _id: new mongoose.Types.ObjectId(),
            name: req.body.name,
            email: req.body.email,
            password: hash,
            phone: req.body.phone,
            address: req.body.address,
            permission: '2',
            created: Date.now(),
            modified: Date.now()
          });

          newDealreship.save().then(() => {
            res.status(200).send(messages.DEALERSHIP_CREATED);
          }).catch(newDealershipSaveErr => {
            return res.status(500).send({
              'newDealershipSaveErr': newDealershipSaveErr.message
            });
          });
        }).catch(bcryptHashErr => {
          return res.status(500).send({
            'bcryptHashErr': bcryptHashErr.message
          });
        });
      }).catch(findErr => {
        return res.status(500).send({
          'findErr': findErr.message
        });
      });
    }).catch(checkPermissionError => {
      return res.status(500).send({ '500 -- ERROR': checkPermissionError.message });
    });
};

exports.createAdmin = (req, res, next) => {
  if (req.params.key !== process.env.ADMIN_KEY) {
    return res.status(403).send({ '403 -- ERROR': messages.UNAUTHORIZED_ACTION });
  }

  bcryptjs.hash(req.body.password, 10).then(hash => {
    const admin = new Dealership({
      _id: new mongoose.Types.ObjectId(),
      name: 'admin',
      email: req.body.email,
      password: hash,
      phone: 'admin',
      address: 'admin',
      permission: '1',
      created: Date.now(),
      modified: Date.now()
    });

    admin.save().then(() => {
      res.status(200).send(messages.ADMIN_CREATED);
    }).catch(adminSaveErr => {
      return res.status(500).send({
        'adminSave Error': adminSaveErr.message
      });
    });
  }).catch(bcryptHashErr => {
    return res.status(500).send({
      'bcryptjs Error': bcryptHashErr.message
    });
  });
};

exports.updateDealership = (req, res, next) => {
  Dealership.findById(req.userData.dealershipId)
    .then(checkPermission => {

      // check if correct dealership is updated or if admin is updating
      if (req.userData.dealershipId !== req.params.dealership_id &&
        (Number(checkPermission.permission) !== 1)) {
        return res.status(403).send({ '403 -- ERROR': messages.UNAUTHORIZED_ACTION });
      }

      var updateDealership = {};

      Dealership.findById(req.params.dealership_id)
        .then(dealershipToUpdate => {

          // update email
          if (req.body.email) {
            if (req.body.email.new !== req.body.email.new_confirm) {
              return res.send(messages.DEALERSHIP_CONFIRMATION_NO_MATCH);
            }
            if (req.body.email.old === req.body.email.new) {
              return res.send(messages.DEALERSHIP_DIFFERENT_NEW_EMAIL);
            }

            updateDealership.email = req.body.email.new;
          }

          if (req.body.password) {
            const compareResult = bcryptjs.compareSync(req.body.password.old, dealershipToUpdate.password);
            
            if (!compareResult) {
              return res.status(401).send({'401 -- ERROR': messages.DEALERSHIP_INCORRECT_OLD_PASSWORD});
            }

            if (req.body.password.new !== req.body.password.new_confirm) {
              return res.status(400).send({'400 -- ERROR': messages.DEALERSHIP_PASSWORD_CONFIRMATION_INCORRECT});
            }
            if (req.body.password.old === req.body.password.new) {
              return res.status(400).send({'400 -- ERROR': messages.DEALERSHIP_OLD_PASSWORD_SAME_AS_NEW})
            }

            const hashResult = bcryptjs.hashSync(req.body.password.new, 10);
            if (hashResult.length > 1) {
              updateDealership.password = hashResult;
            } else {
              return res.status(500).send({'bcryptHashSync': messages.DEALERSHIP_UPDATE_HASH_ERROR});
            }
          }

          if (req.body.phone) {
            updateDealership.phone = req.body.phone;
          }
          if (req.body.address) {
            updateDealership.address = req.body.address;
          }
          
          updateDealership.modified = Date.now();

          Dealership.update({ _id: req.params.dealership_id }, { $set: updateDealership })
          .then(() => {
            res.status(200).send(`Successfully updated ${dealershipToUpdate.name}`);
          }).catch(updateDealershipErr => {
            return res.status(500).send({'updateDealershipErr': updateDealershipErr.message });
          });
        }).catch(dealershipToUpdateErr => {
          return res.status(500).send({ 'dealershipToUpdateErr': dealershipToUpdateErr.message });
        });
    }).catch(checkPermissionError => {
      return res.status(500).send({ 'checkPermissionError': checkPermissionError.message });
    });
}

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  if (email.length < 1 || password.length < 1) {
    return res.status(401).send({ '401 -- Error': messages.DEALERSHIP_AUTHENTICATION_FAILED });
  }

  Dealership.find({ 'email': email })
    .exec().then(dealership => {
      if (dealership.length < 1) {
        return res.status(401).send({ '401 -- Error': messages.DEALERSHIP_AUTHENTICATION_FAILED });
      }

      bcryptjs.compare(password, dealership[0].password, (error, result) => {
        if (error) {
          return res.status(401).send({ '401 -- Error': messages.DEALERSHIP_AUTHENTICATION_FAILED });
        }

        if (result) {
          const token = jwt.sign({
            dealershipId: dealership[0]._id,
            dealershipName: dealership[0].name
          },
            process.env.JWT_KEY,
            {
              expiresIn: '1h'
            });

          return res.status(200).send({
            '200 -- Success': messages.DEALERSHIP_AUTHENTICATION_SUCCESSFUL,
            'token': token
          });
        }
        res.status(401).send({ '401 -- Error': messages.DEALERSHIP_AUTHENTICATION_FAILED });
      });

    }).catch(dealershipFindErr => {
      return res.status(500).send({
        'dealershipFindErr Error': dealershipFindErr.message
      });
    });
};