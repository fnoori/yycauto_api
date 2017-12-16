'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/* For password encryption */
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

var UserSchema = new Schema({
    username: String,
    password: String,
    dealership: String
});

// Encrypts the incoming password
UserSchema.pre('save', function (next) {
    var user = this;
    if (!user.isModified('password')) {
        return next();
    }

    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) {
            return next(err);
        }
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) {
                return next(err)
            }

            user.password = hash;
            next();
        });
    })
});

module.exports = mongoose.model('users', UserSchema);