'use strict';

var mongoose = require('mongoose'),
    users = mongoose.model('users');
var jwt = require('jsonwebtoken');

/* 
    For password encryption 
*/
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

/*
    This will not work for yycauto just yet
    This was created to test/learn how account creation is done
*/
exports.createAccount = function (req, res) {
    var userData = new users({
        username: req.params.username,
        password: req.params.password,
        dealership: req.params.dealership
    })

    userData.save(function (err, data) {
        if (err) {
            res.send(err);
        }
        res.json(data);
    })
}

exports.loginUser = function (req, res) {
    users.find({ 'username': req.params.username }, { _id: false })
    .populate('dealership')
    .exec(function (getError, content) {

        // If the user doesn't exist
        if (getError) {
            res.send(getError)
        }

        // If the user does not exist
        if (content.length <= 0) {
            res.json({ success: false, message: 'Authentication failed, username is invalid' });

        // User exists, compare the password passed
        } else if (content.length > 0) {
            bcrypt.compare(req.params.password, content[0].password, function (compareError, isMatch) {
                if (!isMatch) {
                    return res.json({ success: false, message: 'Authentication failed, password is invalid' });
                }

                // if user is found and password is right
                // create a token with only our given payload
                // we don't want to pass in the entire user since that has the password
                const payload = {
                    dealershipId: content[0].dealership
                };

                console.log(content[0]);

                // expires in 24 hours
                //1440
                var token = jwt.sign(payload, req.app.get('secretKey'), {
                    expiresIn: 1440
                });


                console.log(content);

                // return the information including token as JSON
                res.json({
                    success: true,
                    message: 'Enjoy your token!',
                    dealership: content[0].dealership._id,
                    dealershipName: content[0].dealership.Dealership,
                    token: token
                });
            });
        }
    });
}