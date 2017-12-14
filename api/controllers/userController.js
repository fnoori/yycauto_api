'use strict';

var mongoose = require('mongoose'),
    users = mongoose.model('users');
var jwt = require('jsonwebtoken');

/* For password encryption */
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

exports.createAccount = function (req, res) {
    var userData = new users({
        username: req.params.username,
        password: req.params.password,
        dealershipId: req.params.dealershipId
    })

    userData.save(function (err, data) {
        if (err) {
            res.send(err);
        }
        res.json(data);
    })
}

exports.loginUser = function (req, res) {
    users.find({ 'username': req.params.username }, { _id: false }, function (getError, content) {

        if (getError) {
            res.send(getError)
        }

        if (content.length <= 0) {
            res.json({ success: false, message: 'Authentication failed. User not found.' });

        } else if (content.length > 0) {
            bcrypt.compare(req.params.password, content[0].password, function (compareError, isMatch) {
                if (!isMatch) {
                    return res.json({ success: false, message: 'Authentication failed. Wrong password.' });
                }

                // if user is found and password is right
                // create a token with only our given payload
                // we don't want to pass in the entire user since that has the password
                const payload = {
                    username: content.username
                };

                // expires in 24 hours
                //1440
                var token = jwt.sign(payload, req.app.get('secretKey'), {
                    expiresIn: 1440
                });

                // return the information including token as JSON
                res.json({
                    success: true,
                    message: 'Enjoy your token!',
                    token: token
                });
            });
        }
    });
}

exports.logoutUser = function(req, res) {
    
}