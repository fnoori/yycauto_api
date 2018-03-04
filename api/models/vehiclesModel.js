'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VehiclesSchema = new Schema({});
var VehicleInsertSchema = new Schema({
    
    // basic info
    make: {
        type: String,
        required: 'Vehicle make is required'
    },
    model: {
        type: String,
        required: 'Vehicle model is required'
    },
    trim: {
        type: String
    },
    year: {
        type: String
    },
    extColour: {
        type: String
    },
    intColour: {
        type: String
    },
    numDoors: {
        type: String
    },
    noSeats: {
        type: String
    },
    price: {
        type: String
    },
    kilometres: {
        type: String
    },
    fuelType: {
        type: String,
        required: 'Fuel type is required'
    },
    bodyType: {
        type: String,   
        required: 'Body type is required'
    },

    // mechanical
    carProof: {
        type: String
    },
    trans: {
        type: String,
        required: 'Transmission is required'
    },
    engineSize: {
        type: String
    },
    recommendedFuel: {
        type: String
    },
    cylinders: {
        type: String
    },
    horsePower: {
        type: String
    },
    torque: {
        type: String
    },
    driveTrain: {
        type: String
    },

    // economy
    cityEco: {
        type: String
    },

    highwayEco: {
        type: String
    },

    combinedEco: {
        type: String
    },

    /*
    :dealershipName/:make/:model/:type/:extColor/:intColor/' +
        ':fuelType/:transmission/:minPrice/:maxPrice/:tier
    */

});

module.exports = mongoose.model('vehicles', VehiclesSchema);