const mongoose = require('mongoose');

const dealershipSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  permission: { type: String, required: true },
  created: { type: Date, required: true },
  modified: { type: Date, required: true }
});

module.exports = mongoose.model('Dealership', dealershipSchema);