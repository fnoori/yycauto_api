const mongoose = require('mongoose');
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
}