'use strict';

var mongoose = require('mongoose');
var vehicles = mongoose.model('vehicles');

exports.listAllVehicles = function(req, res) {
    vehicles.find({}, function(err, content) {
        if (err) {
            res.send(err);
        } else {
            res.json(content)
        }
    });
}