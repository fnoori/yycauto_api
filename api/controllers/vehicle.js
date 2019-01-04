const mongoose = require('mongoose');
const validator = require('validator');

exports.get_all_vehicles = (req, res, next) => {
  res.json({
    message: 'in get_all_vehicles'
  });
}
