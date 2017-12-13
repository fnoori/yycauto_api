'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VehiclesSchema = new Schema({});

module.exports = mongoose.model('vehicles', VehiclesSchema);