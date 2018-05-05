const mongoose = require('mongoose');
const Error = require('../models/error');

exports.logError = (req, res, next) => {
    var dateTime = new Date();

    console.log(req);
    const error = new Error({
        _id: new mongoose.Types.ObjectId(),
        'Date': dateTime,
        'Error Message': req
    });
    error.save().then(result => {
        console.log(result);
    });    
}

