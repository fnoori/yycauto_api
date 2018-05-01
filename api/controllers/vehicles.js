const mongoose = require('mongoose');
const Vehicle = require('../models/vehicle');

exports.get_vehicles = (req, res, next) => {
	Vehicle.find()
	.select('name price _id productImage')
	.exec()
	.then(docs => {
		const response = {
			count: docs.length,
			vehicles: docs.map(doc => {
				return {
					name: doc.name,
					price: doc.price,
					productImgae: doc.productImage,
					_id: doc._id,
					request: {
						type: 'GET',
						url: 'http://localhost:3000/vehicles/' + doc._id
					}
				}
			})
		};
		res.status(200).json(response);
	})
	.catch(err => {
		console.log(err);
		res.status(500).json({
			error: err
		});
	})
}

exports.get_vehicles_by_id = (req, res, next) => {
	const id = req.params.vehicleId;

	Vehicle.findById(id)
	.select('name price _id productImage')
	.exec()
	.then(doc => {
		console.log("From database", doc);
		if (doc) {
			res.status(200).json({
				vehicle: doc,
				request: {
					type: 'GET',
					url: 'http://localhost:3000/vehicles/'
				}
			});	
		} else {
			res.status(404).json({
				message: 'No valid entry found for the provided ID'
			});
		}
	})
	.catch(err => {
		console.log(err);
		res.status(500).json({error: err});
	});
}

exports.add_vehicle = (req, res, next) => {
	console.log(req.file);
	const vehicle = new Vehicle({
		_id: new mongoose.Types.ObjectId(),
		name: req.body.name,
		price: req.body.price,
		productImage: req.file.path
	});
	vehicle
	.save()
	.then(result => {
		console.log(result);
		res.status(201).json({
			message: 'Created vehicle successfully',
			createdVehicle: {
				name: result.name,
				price: result.price,
				_id: result._id,
				request: {
					type: 'GET',
					url: 'http://localhost:3000/vehicles/' + result._id
				}
			}
		});
	})
	.catch(err => console.log(err));
}

exports.update_vehicle = (req, res, next) => {
	const id = req.params.vehicleId;
	const updateOperations = {};
	for (const operations of req.body) {
		updateOperations[operations.propName] = operations.value;
	}

	Vehicle.update({ _id: id }, { $set: updateOperations })
	.exec()
	.then(result => {
		res.status(200).json({
			message: 'Vehicle updated successfully',
			request: {
				type: 'GET',
				url: 'http://localhost:3000/vehicles/' + id
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

exports.delete_vehicle = (req, res, next) => {
	const id = req.params.vehicleId;
	Vehicle.remove({_id: id})
	.exec()
	.then(result => {
		res.status(200).json({
			message: 'Vehicle deleted',
			requested: {
				type: 'POST',
				url: 'http://localhost:3000/vehicles',
				body: {
					name: 'String',
					price: 'Number'
				}
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