const fs = require('fs');

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

	uploadFile: function(filename, dest) {
		// Uploads a local file to the bucket
		storage
		.bucket(bucketName)
		.upload(filename, {destination: dest})
		.then(() => {
			console.log(`${filename} uploaded to ${bucketName}.`);
            fs.unlink(filename, err => {
                if (err) {
                    console.log('Failed to delete temporary file');
                }
            });
		}).catch(err => {
			console.error('ERROR:', err);
		});
		// [END storage_upload_file]
	}
};