// Imports the Google Cloud client library
Storage = require('@google-cloud/storage');

// Your Google Cloud Platform project ID
projectId = '156709461219';

// Creates a client
exports.storage = new Storage({
	projectId: projectId,
	keyFilename: './YYCAutomotives-7de8639e0a53.json'
});

exports.bucketName = 'yycauto';

