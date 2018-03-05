'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VehiclesSchema = new Schema({});
var InsertVehiclesSchema = new Schema({
    
    // basic info
    BasicInfo: {
        Make: {
            type: String,
            required: 'Vehicle make is required'
        },
        Model: {
            type: String,
            required: 'Vehicle model is required'
        },
        Trim: {
            type: String
        },
    },

    DealershipInfo: {
        Dealership: {
            type: String,
            required: 'Dealership name is required'
        }
    }


    /*
    Year: {
        type: String
    },
    ExteriorColor: {
        type: String
    },
    InteriorColor: {
        type: String
    },
    NumberOfDoors: {
        type: String
    },
    NumberOfSeats: {
        type: String
    },
    Price: {
        type: String
    },
    Kilometres: {
        type: String
    },
    FuelType: {
        type: String,
        required: 'Fuel type is required'
    },
    BodyType: {
        type: String,   
        required: 'Body type is required'
    },

    // Dealership
    DealershipName: {
        type: String,
        required: 'Dealership name is required'
    },

    AdTier: {
        type: String,
        required: 'Ad Tier is required'
    },

    // mechanical
    CarProof: {
        type: String
    },
    Transmission: {
        type: String,
        required: 'Transmission is required'
    },
    EngineSize: {
        type: String
    },
    RecommendedFuel: {
        type: String
    },
    Cylinders: {
        type: String
    },
    Horsepower: {
        type: String
    },
    Torque: {
        type: String
    },

    // economy
    CityFuelEconomy: {
        type: String
    },

    HighwayFuelEconomy: {
        type: String
    },

    CombinedFuelEconomy: {
        type: String
    }

    */

    /*
    :dealershipName/:make/:model/:type/:extColor/:intColor/' +
        ':fuelType/:transmission/:minPrice/:maxPrice/:tier
    */

});

module.exports = mongoose.model('vehicles', InsertVehiclesSchema);