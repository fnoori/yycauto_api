const mongoose = require('mongoose');

const errorSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    'Date': { type: Date, required: true },
    'Error Message': { type: String, required: true },
    'Error Stack': {type: String, required: true}
});

module.exports = mongoose.model('Error', errorSchema);
