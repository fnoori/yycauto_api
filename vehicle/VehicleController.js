var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
var Vehicle = require('./Vehicle');
var checkAuth = require('../middleware/checkAuth');
var auth0 = require('auth0');

router.post('/', function(req, res) {
  var newVehicle = new Vehicle({
    make: req.body.make,
    model: req.body.model,
    date_created: Date.now()
  });

  console.log(newVehicle);

  Vehicle.create({newVehicle},
  function(err, vehicle) {
    if (err) {
      console.log(err);
      return res.status(500).send('There was an error adding the information to the database');
    }
    res.status(200).send(vehicle);
  });
});

router.get('/', function(req, res)  {


  /*

  var AuthenticationClient = require('auth0').AuthenticationClient;

  var auth0 = new AuthenticationClient({
    domain:       'yyc-automotives.auth0.com',
    clientID:     'oDirEaWUdc43-Dao3IfGgBVTme_IpYDT'
  });

  
  auth0.getProfile(req.headers.authorization.split(' ')[1], function(err, user) {
    if (err) {
      console.log('Error', err);
      return res.status(500).send('An error occurred while trying to retreieve profile')
    }
    console.log(user);
    res.status(200).send(user); 
  });
  return;

  */

  Vehicle.find({}, function(err, vehicles) {
    if (err) {
      return res.status(500).send('There was an error in finding the vehicles');
    }
    res.status(200).send(vehicles);
  });
});

router.get('/:id', function(req, res) {
  Vehicle.findById(req.params.id, function(err, vehicle) {
    if (err) {
      console.log(err);
      return res.status(500).send('There is no vehicle with that id');
    }
    res.status(200).send(vehicle);
  });
});

router.delete('/:id', function(req, res) {
  Vehicle.findByIdAndRemove(req.params.id, function(err, vehicle) {
    if (err) {
      return res.status(500).send('Failed to delete vehicle');
    }
    res.status(200).send(`Vehicle ${vehicle} was deleted successfully`);
  });
});

router.put('/:id', function(req, res) {
  var updatedValues = {
    Make: req.body.make,
    Model: req.body.model
  };

  Vehicle.findByIdAndUpdate(req.params.id, updatedValues, {new: true}, function(err, vehicle) {
    if (err) {
      return res.status(500).send('Failed to updated vehicle');
    }
    res.status(200).send(vehicle);
  });
});

module.exports = router;