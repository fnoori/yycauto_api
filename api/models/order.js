const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	vehicle: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Vehicle',
		require: true
	},
	quantity: {
		type: Number,
		default: 1
	}
});

module.exports = mongoose.model('Order', orderSchema);