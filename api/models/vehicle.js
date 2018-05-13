const mongoose = require('mongoose');

const vehicleSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    'BasicInfo': {
        'Make': {type: String, required: true},
        'Model': {type: String, required: true},
        'Trim': {type: String, required: true},
        'Type': {type: String, required: true},
        'Year': {type: String, required: true},
        'Exterior Colour': {type: String, required: true},
        'Interior Colour': {type: String, required: false},
        'Price': {type: String, required: true},
        'Kilometres': {type: String, required: true},
        'Fuel Type': {type: String, required: true},
        'Doors': {type: String, required: false},
        'Seats': {type: String, required: false},
        'Description': {type: String, required: false}
    },
    'MechanicalSpecs': {
        'CarProof': {type: String, required: false},
        'Transmission': {type: String, required: true},
        'Engine Size (L)': {type: String, required: false},
        'Cylinders': {type: String, required: false},
        'Horsepower @ RPM': {type: String, required: false},
        'Torque (lb - ft) @ RPM': {type: String, required: false},
        'Recommended Fuel': {type: String, required: true}
    },
    'FuelEconomy': {
        "City (L/100Km)": {type: String, required: false},
        "Highway (L/100Km)": {type: String, required: false},
        "Combined (L/100Km)": {type: String, required: false}
    },
    'Dealership': {
        _id: {type: mongoose.Schema.Types.ObjectId, required: true},
        Name: {type: String, required: true},
        Email: {type: String, required: true},
        Phone: {type: String, required: true},
        Address: {type: String, required: true}
    },
    'VehicleFeatures': {type: Array, required: false},
    'AdTier': {type: String, required: true}
});

module.exports = mongoose.model('Vehicle', vehicleSchema);