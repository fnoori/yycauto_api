const _ = require('underscore');

exports.isLengthCorrect = (checkText, minLength, maxLength) => {
  if ((checkText.trim().length <= minLength) || (checkText.length > maxLength)) {
    return false;
  } else {
    return true;
  }
}

exports.isLengthExact = (checkText, exactLength) => {
  if (checkText.trim().length === exactLength) {
    return true;
  } else {
    return false;
  }
}
