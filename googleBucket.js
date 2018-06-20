// Imports the Google Cloud client library
const Storage = require('@google-cloud/storage');

// Your Google Cloud Platform project ID
const projectId = '156709461219';

// Creates a client
const storage = new Storage({
	projectId: projectId,
	keyFilename: './YYCAutomotives-7de8639e0a53.json'
});

const bucketName = 'yycauto';

module.exports = {
	listFiles: function() {

		/**
		* TODO(developer): Uncomment the following line before running the sample.
		*/
		// const bucketName = 'Name of a bucket, e.g. my-bucket';

		// Lists files in the bucket
		storage
		.bucket(bucketName)
		.getFiles()
		.then(results => {
			const files = results[0];

			console.log('Files:');
			files.forEach(file => {
				console.log(file.name);
			});
		}).catch(err => {
			console.error('ERROR:', err);
		});
		// [END storage_list_files]
	},

	uploadFile: function(filename) {
		/**
		* TODO(developer): Uncomment the following lines before running the sample.
		*/
		// const bucketName = 'Name of a bucket, e.g. my-bucket';
		// const filename = 'Local file to upload, e.g. ./local/path/to/file.txt';

		// Uploads a local file to the bucket
		storage
		.bucket(bucketName)
		.upload(filename)
		.then(() => {
			console.log(`${filename} uploaded to ${bucketName}.`);
		}).catch(err => {
			console.error('ERROR:', err);
		});
		// [END storage_upload_file]
	}
};