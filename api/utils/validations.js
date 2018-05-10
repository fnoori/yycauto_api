const errors = require('../utils/resMessages');

exports.validateEmail = (email) => {
    var emailRe = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRe.test(String(email).toLowerCase());
}

exports.validatePassword = (password) => {
    var passwordRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordRe.test(String(password));
}

exports.validateDealershipUpdate = (updateOperations) => {
    var allErrors = {};

    if (updateOperations['AccountCredentials.Email']) {
        if (!this.validateEmail(updateOperations['AccountCredentials.Email'])) {
            allErrors.email = errors.INVALID_EMAIL;
        }
    }
    if (updateOperations['AccountCredentials.Password'] &&
        updateOperations.OldPassword) {
        if (!this.validatePassword(updateOperations['AccountCredentials.Password'])) {
            allErrors.password = errors.INVALID_PASSWORD;
        }
    }
    if (updateOperations.Phone && 
        updateOperations.Phone.length <= 0) {
        allErrors.phone = errors.UPDATE_PHONE_INVALID;
    }
    if (updateOperations.Address &&
        updateOperations.Address.length <= 0) {
        allErrors.address = errors.UPDATE_ADDRESS_INVALID;
    }

    return allErrors;
}

exports.validateDealershipCreation = (creationOperations) => {
    var allErrors = {};

    if (!this.validateEmail(creationOperations['AccountCredentials.Email'])) {
        allErrors.email = errors.INVALID_EMAIL;
    }
    if (!this.validatePassword(creationOperations['AccountCredentials.Password'])) {
        allErrors.password = errors.INVALID_PASSWORD;
    }
    if (creationOperations.Name.length <= 0) {
        allErrors.name = errors.PROVIDE_DEALERSHIP_NAME;
    }
    if (creationOperations.Phone.length <= 0) {
        allErrors.phone = errors.PROVIDE_PHONE_NUMBER;
    }
    if (creationOperations.Address.length <= 0) {
        allErrors.address = errors.PROVIDE_ADDRESS;
    }

    return allErrors;
}