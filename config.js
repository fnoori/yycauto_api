exports.configureEnvironment = () => {
  switch(process.env.NODE_ENV) {
    case 'development':
      process.env.MONGO_URI = process.env.MONGO_URI_LOCAL;
      process.env.AUTH0_ID_SOURCE = process.env.AUTH0_ID_SOURCE_DEV;
      process.env.IMAGE_MOVE_DESTINATION = process.env.IMAGE_IN_LOCAL;
      process.env.IMAGE_FROM_DESTINATION = process.env.IMAGE_FROM_LOCAL;
      break;
    case 'development-cloudinary':
      process.env.MONGO_URI = process.env.MONGO_URI_LOCAL;
      process.env.AUTH0_ID_SOURCE = process.env.AUTH0_ID_SOURCE_DEV;
      process.env.IMAGE_MOVE_DESTINATION = process.env.IMAGE_IN_CLOUDINARY;
      process.env.IMAGE_FROM_DESTINATION = process.env.IMAGE_FROM_CLOUDINARY;
      break;
    case 'production':
      process.env.MONGO_URI = process.env.MONGO_ATLAS_URI;
      process.env.AUTH0_ID_SOURCE = process.env.AUTH0_ID_SOURCE_TOKEN;
      break;
    default:
      return false;
  }
}
