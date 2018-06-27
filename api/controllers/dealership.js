const mongoose = require('mongoose');

// Models
const Dealership = require('../models/dealership');
//const Vehicle = require('../models/vehicle');

// Required libraries
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');

const tmpDir = 'uploads/tmp/logos/';
const toExcludeFromFind = '-AccountCredentials.Password -__v -_id -AccountCredentials.AccessLevel';

exports.createDealershipAccount = (req, res, next) => {
    
}
