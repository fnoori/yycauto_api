const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
	res.status(200).json({
		message: 'Dealership were fetched'
	});
});

router.get('/:dealershipId', (req, res, next) => {
	res.status(201).json({
		message: 'Dealership details',
		dealershipId: req.params.dealershipId
	});
});


router.post('/', (req, res, next) => {
	res.status(201).json({
		message: 'Dealership were created'
	});
});


router.delete('/:dealershipId', (req, res, next) => {
	res.status(201).json({
		message: 'Dealership deleted',
		dealershipId: req.params.dealershipId
	});
});


module.exports = router;