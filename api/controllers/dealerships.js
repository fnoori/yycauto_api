const mongoose = require('mongoose');
const Dealership = require('../models/dealership');
const errors = require('../utils/error');

exports.getAllDealerships = (req, res, next) => {
    Dealership.find()
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            dealerships: docs.map(doc => {
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

exports.getDealershipByID = (req, res, next) => {
    const ID = req.params.dealershipId;
    
    Dealership.findById(ID)
    .exec()
    .then(doc => {
        if (doc) {
            res.status(200).json({
                dealership: doc
            });
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