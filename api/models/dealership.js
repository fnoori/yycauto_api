const mongoose = require('mongoose');

const dealershipSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    'name': { type: String, required: true, max: 50 },
    'email': { type: String, required: true, max: 100 },
    'phone': { type: String, required: true, max: 15 },
    'address': { type: String, required: true, max: 50  },
    'permission': { type: Number, required: true }
});

module.exports = mongoose.model('Dealership', dealershipSchema);