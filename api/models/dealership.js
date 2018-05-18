const mongoose = require('mongoose');

const dealershipSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    'Name': { type: String, required: true, max: 50 },
    'Phone': { type: String, required: true, max: 15 },
    'Address': { type: String, required: true, max: 50  },
    'Logo': { type: String, required: false },
    'AccountCredentials': {
        'Email': { 
            type: String,
            required: true,
            match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            max: 50 
        },
        'Password': { 
            type: String,
            required: true,
            match: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
        },
        'AccessLevel': { type: Number, required: true }
    }
});

module.exports = mongoose.model('Dealership', dealershipSchema);