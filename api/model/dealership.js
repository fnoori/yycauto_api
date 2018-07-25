const mongoose = require('mongoose');

const dealershipSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    permission: { type: Number, required: true }
});

module.exports = mongoose.model('Dealership', dealershipSchema);