const mongoose = require('mongoose');

const vehicleSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    'BasicInfo': {
        'Make': {type: String, required: true, max: 15},
        'Model': {type: String, required: true, max: 15},
        'Trim': {type: String, required: true, max: 10},
        'Type': {type: String, required: true, max: 20},
        'Year': {type: String, required: true, max: 4},
        'Exterior Colour': {type: String, required: true, max: 20},
        'Interior Colour': {type: String, required: false, max: 20},
        'Price': {type: String, required: true, max: 10},
        'Kilometres': {type: String, required: true, max: 8},
        'Fuel Type': {type: String, required: true, max: 20},
        'Doors': {type: String, required: false, max: 2},
        'Seats': {type: String, required: false, max: 2},
        'Description': {type: String, required: false, max: 300}
    },
    'MechanicalSpecs': {
        'CarProof': {type: Boolean, required: false},
        'Transmission': {type: String, required: true, max: 20},
        'Engine Size (L)': {type: String, required: false, max: 6},
        'Cylinders': {type: String, required: false, max: 2},
        'Horsepower @ RPM': {type: String, required: false, max: 6},
        'Torque (lb - ft) @ RPM': {type: String, required: false, max: 6},
        'Recommended Fuel': {type: String, required: true, max: 20}
    },
    'FuelEconomy': {
        "City (L/100Km)": {type: String, required: false, max: 6},
        "Highway (L/100Km)": {type: String, required: false, max: 6},
        "Combined (L/100Km)": {type: String, required: false, max: 6}
    },
    'Dealership': {
        _id: {type: mongoose.Schema.Types.ObjectId, required: true},
        Name: {type: String, required: true, max: 50},
        Email: {type: String, required: true, max: 50},
        Phone: {type: String, required: true, max: 15},
        Address: {type: String, required: true, max: 50}
    },
    'VehicleFeatures': {type: Array, required: false},
    'AdTier': {type: String, required: true}
});

module.exports = mongoose.model('Vehicle', vehicleSchema);