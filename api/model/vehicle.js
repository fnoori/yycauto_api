const mongoose = require('mongoose');

const vehicleSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  basic_info: {
    make: { type: String, required: true },
    model: { type: String, required: true },
    trim: { type: String, required: true },
    type: { type: String, required: true },
    year: { type: String, required: true },
    exterior_colour: { type: String, required: true },
    interior_colour: { type: String, required: false },
    price: { type: String, required: true },
    kilometres: { type: String, required: true },
    fuel_type: { type: String, required: true },
    doors: { type: String, required: false },
    seats: { type: String, required: false },
    description: { type: String, required: false  }
  },
  mechanical_specs: {
    car_proof: { type: Boolean, required: false },
    transmission: { type: String, required: true },
    engine_size: { type: String, required: false },
    cylinders: { type: String, required: false },
    horsepower: { type: String, required: false },
    torque: { type: String, required: false },
    recommended_fuel: { type: String, required: true  }
  },
  fuel_economy: {
    city: { type: String, required: false },
    highway: { type: String, required: false },
    combined: { type: String, required: false  }
  },
  dealership: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dealership',
    required: true
  },
  vehicle_photos: { type: Array, required: true },
  vehicle_feature: { type: Array, required: false },
  ad_tier: { type: String, required: true },
  date: {
    created: { type: Date, required: true },
    updated: { type: Date, required: true }
  }
});

module.exports = mongoose.model('Vehicle', vehicleSchema);