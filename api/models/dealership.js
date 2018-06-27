const mongoose = require('mongoose');

const dealershipSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    'Name': {
        type: String,
        required: true,
        max: 100
    },
    'Phone': {
        type: String,
        required: true,
        max: 20
    },
    'Address': {
        type: String,
        required: true,
        max: 100
    },
    'Logo': {
        type: String,
        required: false
    },
    'AccountCredentials': {
        'Email': {
            type: String,
            required: true,
            max: 100
        },
        'Password': {
            type: String,
            required: true
        },
        'AccessLevel': {
            type: Number,
            required: true
        }
    }
});

module.exports = mongoose.model('Dealership', dealershipSchema);
