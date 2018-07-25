const mongoose = require('mongoose');
const Vehicle = require('../model/vehicle');
const Dealership = require('../model/dealership');

const rootTempVehicleDir = 'uploads/tmp/vehicles/';

const omitFromFind = '-__v -Dealership._id';

exports.getAllVehicles = (req, res, next) => {
  const lazyLoad = parseInt(req.params.lazyLoad);
  const perPage = parseInt(req.params.perPage);

  Vehicle.find()
    .skip(lazyLoad).limit(perPage)
    .populate('Dealership')
    .select(omitFromFind)
    .exec().then(docs => {
      res.status(200).send(docs);
    }).catch(vehicleFindErr => {
      return res.status(500).send({
        'Error': vehicleFindErr.message
      });
    });
}