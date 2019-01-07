exports.checkLength = (checkText, maxLength) => {
  if (checkText.length > maxLength) {
    return false;
  } else {
    return true;
  }
}
