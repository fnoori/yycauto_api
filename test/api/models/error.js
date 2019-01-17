const mongoose = require('mongoose');

const errorSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    error_code: { type: String },
    error_message: { type: String },
    date_time: { type: String }
});

module.exports = mongoose.model('Error', errorSchema);
