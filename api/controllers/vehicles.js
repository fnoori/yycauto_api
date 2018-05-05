const mongoose = require('mongoose');
const Vehicle = require('../models/vehicle');

exports.getAllVehicles = (req, res, next) => {
    Vehicle.find()
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            vehicles: docs.map(doc => {
                return {
                    content: doc
                }
            })
        };
        res.status(200).json(response);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
}