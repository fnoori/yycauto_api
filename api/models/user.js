const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    auth0_id: { type: String },
    email: { type: String },
    phone: { type: String, max: 20 },
    address: { type: String, max: 70 },
    dealership_name: { type: String, max: 50 },
    dealership_hours: {
      'Monday': { from: { type: String, max: 4, min: 4 }, to: { type: String, max: 4, min: 4 } },
      'Tuesday': { from: { type: String, max: 4, min: 4 }, to: { type: String, max: 4, min: 4 } },
      'Wednesday': { from: { type: String, max: 4, min: 4 }, to: { type: String, max: 4, min: 4 } },
      'Thursday': { from: { type: String, max: 4, min: 4 }, to: { type: String, max: 4, min: 4 } },
      'Friday': { from: { type: String, max: 4, min: 4 }, to: { type: String, max: 4, min: 4 } },
      'Saturday': { from: { type: String, max: 4, min: 4 }, to: { type: String, max: 4, min: 4 } },
      'Sunday': { from: { type: String, max: 4, min: 4 }, to: { type: String, max: 4, min: 4 } }
    },
    'date': {
      'created': {type: Date, required: true},
      'modified': {type: Date, require: true}
    }
});

module.exports = mongoose.model('User', userSchema);
