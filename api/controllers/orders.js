const Order = require('../models/order');
const Vehicle = require('../models/vehicle');
const mongoose = require('mongoose');

exports.orders_get_all = (req, res, next) => {
	Order.find()
	.select('vehicle _id quantity')
	.populate('vehicle', '-__v')
	.exec()
	.then(docs => {
		res.status(200).json({
			count: docs.length,
			orders: docs.map(doc => {
				return {
					_id: doc._id,
					vehicle: doc.vehicle,
					quantity: doc.quantity,
					request: {
						type: 'GET',
						url: 'http://localhost:3000/orders/' + doc._id
					}
				}
			})
		});
	})
	.catch(err => {
		res.status(500).json({
			error: err
		});
	});
}

exports.orders_get_by_id = (req, res, next) => {
	Order.findById(req.params.orderId)
	.select('-__v')
	.populate('vehicle', '-__v')
	.exec()
	.then(order => {
		if (!order) {
			return res.status(404).json({
				message: 'Order not found'
			});
		}

		res.status(200).json({
			order: order,
			request: {
				type: 'GET',
				url: 'http://localhost:3000/orders'
			}
		});
	})
	.catch(err => {
		res.status(500).json({
			error: err
		});
	});
}

exports.orders_create_order = (req, res, next) => {
	console.log(req.body.vehicleId);
	Vehicle.findById(req.body.vehicleId)
	.then(vehicle => {
		if (!vehicle) {
			return res.status(404).json({
				message: 'Vehicle not found'
			});
		}

		const order = new Order({
			_id: mongoose.Types.ObjectId(),
			quantity: req.body.quantity,
			vehicle: req.body.vehicleId
		});

		console.log(order);

		return order.save();
	})
	.then(result => {
		console.log(result);
		res.status(201).json({
			message: 'Order added',
			createdOrder: {
				id: result._id,
				vehicle: result.vehicle,
				quantity: result.quantity
			},
			request: {
				type: 'GET',
				url: 'http://localhost:3000/orders/' + result._id
			}
		});
	})
	.catch(err => {
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
}

exports.orders_delete_order = (req, res, next) => {
	Order.remove({
		_id: req.params.orderId
	})
	.exec()
	.then(result => {
		res.status(200).json({
			message: 'Order deleted',
			request: {
				type: 'POST',
				url: 'http://localhost:3000/orders',
				body: {
					vehicleId: 'ID',
					quantity: 'Number'
				}
			}
		});
	})
	.catch(err => {
		res.status(500).json({
			error: err
		});
	});
}