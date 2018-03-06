'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VehiclesSchema = new Schema({});
var InsertVehiclesSchema = new Schema({
    
    // basic info
    BasicInfo: {
        Make: {
            type: String,
            required: true
        },
        Model: {
            type: String,
            required: true
        },
        Trim: {
            type: String
        },
        ExteriorColor: {
            type: String,
            required: true
        },
        Year: {
            type: String,
            required: true
        },
        Price: {
            type: String,
            required: true
        },
        Kilometers: {
            type: String,
            required: true
        },
        FuelType: {
            type: String,
            required: true
        },
        BodyType: {
            type: String,
            required: true
        },
        NumberOfDoors: {
            type: String
        },
        NumberOfSeats: {
            type: String
        }
    },

    AdTier: {
        type: String
    },

    DescriptionOfVehicle: {
        type: String,
        required: true
    },

    MechanicalSpecs: {
        CarProof: {
            type: String
        },
        'Transmission': {
            type: String,
            required: true
        },
        'Engine Size (L)': {
            type: String,
            required: true
        },
        'Cylinders': {
            type: String,
            required: true
        },
        'Horsepower @ RPM': {
            type: String,
            required: true
        },
        'Torque (lb - ft) @ RPM': {
            type: String,
            required: true
        },
        'Recommended Fuel': {
            type: String,
            required: true
        }
    },

    FuelEconomy: {
        'City (L/100Km)': {
            type: String,
            required: true
        },
        'Highway (L/100Km)': {
            type: String,
            required: true
        },
        'Combined (L/100Km)': {
            type: String,
            required: true
        }
    },

    Dealership: {
        type: String
    },

    ExtraFeatures: {
        type: Array
    }
});

module.exports = mongoose.model('vehicles', InsertVehiclesSchema);