'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VehiclesSchema = new Schema({
    
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
        InteriorColor: {
            type: String
        },
        Year: {
            type: String,
            required: true
        },
        Price: {
            type: String,
            required: true
        },
        Kilometres: {
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

    VehiclePictures: {
        type: Array,
        required: true
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'dealerships'
    },

    ExtraFeatures: {
        type: Array
    }
});

module.exports = mongoose.model('vehicles', VehiclesSchema);