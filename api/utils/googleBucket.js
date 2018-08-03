// Imports the Google Cloud client library
Storage = require('@google-cloud/storage');

// Your Google Cloud Platform project ID
projectId = '489585573067';

// Creates a client
exports.storage = new Storage({
	projectId: projectId,
	keyFilename: './api/utils/YYC Automotives-17b9504588f0.json'
});

exports.bucketName = 'yyc-automotives';