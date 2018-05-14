const resMessages = require('../utils/resMessages');

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
            allErrors.email = resMessages.INVALID_EMAIL;
        }
    }
    if (updateOperations['AccountCredentials.Password'] &&
        updateOperations.OldPassword) {
        if (!this.validatePassword(updateOperations['AccountCredentials.Password'])) {
            allErrors.password = resMessages.INVALID_PASSWORD;
        }
    }
    if (updateOperations.Phone && 
        updateOperations.Phone.length <= 0) {
        allErrors.phone = resMessages.UPDATE_PHONE_INVALID;
    }
    if (updateOperations.Address &&
        updateOperations.Address.length <= 0) {
        allErrors.address = resMessages.UPDATE_ADDRESS_INVALID;
    }

    return allErrors;
}

exports.validateDealershipCreation = (creationOperations) => {
    var allErrors = {};

    if (!this.validateEmail(creationOperations['AccountCredentials.Email'])) {
        allErrors.email = resMessages.INVALID_EMAIL;
    }
    if (!this.validatePassword(creationOperations['AccountCredentials.Password'])) {
        allErrors.password = resMessages.INVALID_PASSWORD;
    }
    if (creationOperations.Name.length <= 0) {
        allErrors.name = resMessages.PROVIDE_DEALERSHIP_NAME;
    }
    if (creationOperations.Phone.length <= 0) {
        allErrors.phone = resMessages.PROVIDE_PHONE_NUMBER;
    }
    if (creationOperations.Address.length <= 0) {
        allErrors.address = resMessages.PROVIDE_ADDRESS;
    }

    return allErrors;
}

exports.validateVehicleCreation = (creationOperations) => {
    var allErrors = {};
    var toCheck = creationOperations;

    console.log(toCheck);
    console.log('tocheck: ' + toCheck['BasicInfo.Make']);

    if (this.isNullOrEmpty(toCheck['BasicInfo.Make'])) {
        console.log('make is null or empty');
        allErrors.Make = resMessages.FIELD_CANNOT_BE_EMPTY;
    }
    if (this.isNullOrEmpty(toCheck['BasicInfo.Model'])) {
        allErrors['BasicInfo.Model'] = resMessages.FIELD_CANNOT_BE_EMPTY;
    }
    if (this.isNullOrEmpty(toCheck['BasicInfo.Type'])) {
        allErrors['BasicInfo.Type'] = resMessages.FIELD_CANNOT_BE_EMPTY;
    }
    if (this.isNullOrEmpty(toCheck['BasicInfo.Year'])) {
        allErrors['BasicInfo.Year'] = resMessages.FIELD_CANNOT_BE_EMPTY;
    }
    if (this.isNullOrEmpty(toCheck['BasicInfo.Price'])) {
        allErrors['BasicInfo.Price'] = resMessages.FIELD_CANNOT_BE_EMPTY;
    }
    if (this.isNullOrEmpty(toCheck['BasicInfo.Kilometres'])) {
        allErrors['BasicInfo.Kilometres'] = resMessages.FIELD_CANNOT_BE_EMPTY;
    }
    if (this.isNullOrEmpty(toCheck['BasicInfo.Fuel Type'])) {
        allErrors['BasicInfo.Fuel Type'] = resMessages.FIELD_CANNOT_BE_EMPTY;
    }
    if (this.isNullOrEmpty(toCheck['MechanicalSpecs.CarProof'])) {
        allErrors['MechanicalSpecs.CarProof'] = resMessages.FIELD_CANNOT_BE_EMPTY;
    }
    if (this.isNullOrEmpty(toCheck['MechanicalSpecs.Transmission'])) {
        allErrors['MechanicalSpecs.Transmission'] = resMessages.FIELD_CANNOT_BE_EMPTY;
    }
    if (this.isNullOrEmpty(toCheck['MechanicalSpecs.Recommended Fuel'])) {
        allErrors['MechanicalSpecs.Recommended Fuel'] = resMessages.FIELD_CANNOT_BE_EMPTY;
    }
    if (this.isNullOrEmpty(toCheck['AdTier'])) {
        allErrors['AdTier'] = resMessages.FIELD_CANNOT_BE_EMPTY;
    }

    console.log(allErrors);

    return allErrors;
}

exports.isNullOrEmpty = (input) => {
    if (input == null || input.lenght <= 0) {
        return true;
    }

    return false;
}