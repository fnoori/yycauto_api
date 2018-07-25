var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
var Dealership = require('./Dealership');

router.get('/', function(req, res)  {
  Dealership.find({}, function(err, dealerships) {
    if (err) {
      return res.status(500).send('There was a problem in finding the dealership');
    }
    res.status(200).send(dealerships);
  });
});

module.exports = router;