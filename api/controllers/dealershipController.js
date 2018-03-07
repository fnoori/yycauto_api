'use strict';

var mongoose = require('mongoose'),
    dealershipDetails = mongoose.model('dealerships');

exports.getDealershipDetails = function(req, res) {
    dealershipDetails.findById(req.params.dealershipID, function (err, content) {
        if (err) {
            res.send(err);
        }
        res.json(content);
    });
}