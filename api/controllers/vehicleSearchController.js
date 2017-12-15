'use strict';

var mongoose = require('mongoose'),
    searchVehicles = mongoose.model('vehicles');

/*
    Basic search accepts any search string and tier is mandatory
*/
exports.basicSearch = function (req, res) {
    searchVehicles.find({ $text: { $search: req.params.searchQuery }, 'AdTier': req.params.adTier }, function (err, content) {
        if (err) {
            res.send(err);
        }
        res.json(content);
    }).skip(parseInt(req.params.lazyLoadSkipBy)).limit(10);
}

/*
    Advanced search creates a query depending on what
    information came through in the API call.
    All the parameters are optional except the tier and lazyload
*/
exports.advancedSearch = function (req, res) {
    var query = {}
    var priceQuery = {}

    /* 
        Checks if there are any empty parameters
        If there are, those fields are ignore
    */
    for (var key in req.params) {
        if (req.params[key] == -1) {
            query[key] = { $exists: true }
        } else {
            query[key] = req.params[key]
        }
    }

    /* 
        Logic for the min/max price
        Runs through all the possiblities of min/max price and provides the query
    */
    if (req.params.minPrice != -1 && req.params.maxPrice != -1) {
        priceQuery = { $gt: parseFloat(req.params.minPrice), $lt: parseFloat(req.params.maxPrice) }
    } else if (req.params.minPrice != -1 && req.params.maxPrice == -1) {
        priceQuery = { $gt: parseFloat(req.params.minPrice) }
    } else if (req.params.minPrice == -1 && req.params.maxPrice != -1) {
        priceQuery = { $lt: parseFloat(req.params.maxPrice) }
    } else {
        priceQuery = { $exists: true }
    }

    searchVehicles.find({
        'BasicInfo.Make': query['make'],
        'BasicInfo.Model': query['model'],
        'BasicInfo.BodyType': query['type'],
        'BasicInfo.ExteriorColor': query['extColor'],
        'BasicInfo.InteriorColor': query['intColor'],
        'BasicInfo.FuelType': query['fuelType'],
        'MechanicalSpecs.Transmission': query['transmission'],
        'BasicInfo.Price': priceQuery,
        'AdTier': query['tier']
    },
    function (err, content) {
        if (err) {
            res.send(err);
        }
        res.json(content);
    }).skip(parseInt(req.params.lazyLoadSkipBy)).limit(10);
}