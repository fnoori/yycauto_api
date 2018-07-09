const mongoose = require('mongoose');

const dealershipSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    'Name': { type: String, required: true, max: 50 },
    'Phone': { type: String, required: true, max: 15 },
    'Address': { type: String, required: true, max: 50  },
    'AccessLevel': { type: Number, required: true }
});

module.exports = mongoose.model('Dealership', dealershipSchema);