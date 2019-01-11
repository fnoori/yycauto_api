exports.configureEnvironment = () => {
  switch(process.env.NODE_ENV) {
    case 'development':
      process.env.MONGO_URI = process.env.MONGO_URI_LOCAL;
      process.env.AUTH0_ID_SOURCE = process.env.AUTH0_ID_SOURCE_DEV;
      break;
    case 'production':
      process.env.MONGO_URI = process.env.MONGO_ATLAS_URI;
      process.env.AUTH0_ID_SOURCE = process.env.AUTH0_ID_SOURCE_TOKEN;
      break;
    default:
      return false;
  }
}
