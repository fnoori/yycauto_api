const mongoose = require('mongoose');
const Vehicle = require('../models/vehicle');
const errors = require('../utils/error');

exports.getAllVehicles = (req, res, next) => {
    Vehicle.find()
    .populate('Dealership')
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            vehicles: docs
        };
        res.status(200).json(response);
    })
    .catch(err => {
        errors.logError(err);
        res.status(500).json({
            error: err
        });
    });
}

exports.getVehicleByID = (req, res, next) => {
    const ID = req.params.vehicleId;

    Vehicle.findById(ID)
    .populate('Dealership')
    .exec()
    .then(doc => {
        if (doc) {
            res.status(200).json({
                vehicle: doc
            });
        } else {
            res.status(404).json({
                message: 'No vehicle found with matching ID'
            });
        }
    })
    .catch(err =>  {
        errors.logError(err);
        res.status(500).json({
            error: err
        });
    });
}

exports.getVehicleByDealershipID = (req, res, next) => {
    const dealershipID = req.params.dealershipId;
}