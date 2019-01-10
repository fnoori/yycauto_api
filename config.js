exports.configureEnvironment = () => {
  switch(process.env.NODE_ENV) {
    case 'development':
      process.env.MONGO_URI = process.env.MONGO_URI_LOCAL;
      break;
    case 'production':
      process.env.MONGO_URI = process.env.MONGO_ATLAS_URI;
      break;
    default:
      return false;
  }
}
