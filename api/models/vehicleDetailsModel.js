'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var vehicleDetailsSchema = new Schema({});

module.exports = mongoose.model('vehicledetails', vehicleDetailsSchema);