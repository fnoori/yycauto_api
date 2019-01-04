const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    auth0_id: { type: String },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    dealership_name: { type: String },
    dealership_hours: {
      'Monday': { from: { type: String }, to: { type: String } },
      'Tuesday': { from: { type: String }, to: { type: String } },
      'Wednesday': { from: { type: String }, to: { type: String } },
      'Thursday': { from: { type: String }, to: { type: String } },
      'Friday': { from: { type: String }, to: { type: String } },
      'Saturday': { from: { type: String }, to: { type: String } },
      'Sunday': { from: { type: String }, to: { type: String } }
    }
});

module.exports = mongoose.model('User', userSchema);
