'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DealershipSchema = new Schema({
    Dealership: {
        type: String
    },

    DealershipPhone: {
        type: String
    },

    DealershipEmail: {
        type: String
    },

    DealershipCity: {
        type: String
    },

    DealershipLogo: {
        type: String
    }
});

module.exports = mongoose.model('dealerships', DealershipSchema);