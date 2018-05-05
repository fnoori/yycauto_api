const mongoose = require('mongoose');
const Vehicle = require('../models/vehicle');
const errors = require('../utils/error');

exports.getAllVehicles = (req, res, next) => {
    const lazyLoad = parseInt(req.params.lazyLoad);
    const perPage = parseInt(req.params.perPage);

    Vehicle.find()
    .skip(lazyLoad).limit(perPage)
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
    const perPage = parseInt(req.params.perPage);

    Vehicle.find({'Dealership': dealershipID})
    .skip(lazyLoad).limit(perPage)
    .exec()
    .then(doc => {
        if (doc) {
            const response = {
                count: doc.length,
                'Dealership Vehicles': doc
            };
            res.status(200).json(response);
        } else {
            res.status(404).json({
                message: 'No dealership found with matching ID'
            });
        }
    })
    .catch(err => {
        errors.logError(err);
        res.status(500).json({
            error: err
        });
    });
}