'use strict';

var mongoose = require('mongoose');
var vehicles = mongoose.model('vehicles');
var vehicleDetails = mongoose.model('vehicledetails');

/*
    Simply returns all the potential characterstics of a vehicle
*/
exports.getVehicleDetails = function (req, res) {
    vehicleDetails.find({}, { _id: false }, function (err, content) {
        if (err) {
            res.send(err);
        }
        res.json(content);
    });
}

/*
    Accepts tier as argument and returns the vehicles for each tier
*/
exports.getVehicles = function (req, res) {
    vehicles.find({'AdTier': req.params.adTier}, function (err, content) {
        if (err) {
            res.send(err);
        }
        res.json(content)
    }).skip(parseInt(req.params.lazyLoadSkipBy)).limit(10);
}

/*
    This is used only for when a dealership wants to manage their inventory
    Handles:
        searching
        sorting
        acs/desc
        lazyload
*/
exports.getVehiclesForDealer = function (req, res) {
    var findQuery = {}
    var sortQuery = { 'sort': {} }

    var searchQuery = req.params.searchQuery
    var sortBy = req.params.sortBy
    var sortDesc = req.params.sortDesc
    var dealership = req.params.dealership

    /* Determine if there is a need to sort */
    if (sortBy != '-2' && sortDesc != -2) {
        var sortCriteria = {}
        sortCriteria[sortBy] = sortDesc
        sortQuery['sort'] = sortCriteria
    }

    /* Determine if there is search query */
    if (searchQuery != -2) {
        findQuery['$text'] = {}
        findQuery['$text']['$search'] = searchQuery
    }
    findQuery['DealershipInfo.Dealership'] = dealership

    vehicles.find(findQuery, { _id: false }, sortQuery, function (err, content) {
        if (err) {
            res.send(err);
        }
        res.json(content);
    }).skip(parseInt(req.params.perPage) * (parseInt(req.params.currentPage) - 1)).limit(parseInt(req.params.perPage));
}

/*
    Returns the total number of cars for that dealership
    There may be a better way to do this, maybe in one of the
        other functions?
*/
exports.dealershipInventoryCount = function(req, res) {
    vehicles.count({'DealershipInfo.Dealership': req.params.dealership}, function(err, count) {
        if (err) {
            res.send(err);
        }
        res.json(count);
    });
}