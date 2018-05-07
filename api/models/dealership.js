const mongoose = require('mongoose');

const dealershipSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    'Name': { type: String, required: true },
    'Phone': { type: String, required: true },
    'Address': { type: String, required: true },
    'Logo': { type: String, required: false },
    'AccountCredentials': {
        'Email': { 
            type: String,
            required: true,
            match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        },
        'Password': { type: String, required: true },
        'Access Level': { type: Number, required: true }
    }
});

module.exports = mongoose.model('Dealership', dealershipSchema);