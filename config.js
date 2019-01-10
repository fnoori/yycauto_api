exports.configureEnvironment = () => {
  switch(process.env.NODE_ENV) {
    case 'development':
      process.env.MONGO_URI = process.env.MONGO_URI_LOCAL;
    case 'production':
      process.env.MONGO_URI = process.env.MONGO_URI;
    default:
      return false;
  }
}
