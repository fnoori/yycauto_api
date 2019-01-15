exports.configureEnvironment = () => {
  switch(process.env.NODE_ENV) {
    case 'development':
    case 'development-cloudinary':
      process.env.MONGO_URI = process.env.MONGO_URI_LOCAL;
      process.env.AUTH0_ID_SOURCE = process.env.AUTH0_ID_SOURCE_DEV;
      process.env.IMAGE_MOVE_DESTINATION = process.env.IMAGE_IN_LOCAL;
      break;
    case 'production':
      process.env.MONGO_URI = process.env.MONGO_ATLAS_URI;
      process.env.AUTH0_ID_SOURCE = process.env.AUTH0_ID_SOURCE_TOKEN;
      break;
    default:
      return false;
  }
}
