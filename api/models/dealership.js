const mongoose = require('mongoose');

const dealershipSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    'Name': { type: String, required: true },
    'Phone': { type: String, required: true },
    'Email': { type: String, required: true },
    'Address': { type: String, required: true },
    'Logo': { type: String, required: false }
});

module.exports = mongoose.model('Dealership', dealershipSchema);