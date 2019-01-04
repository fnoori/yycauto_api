exports.error_500 = (message) => {
  return {
    message: message,
    error_code: 500
  };
}
