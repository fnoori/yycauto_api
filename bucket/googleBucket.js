const fs = require('fs');
const googleBucketReqs = require('./googleBucketReqs');

module.exports = {
	uploadFile: function(filename, dest) {
		// Uploads a local file to the bucket
		googleBucketReqs.storage
		.bucket(googleBucketReqs.bucketName)
		.upload(filename, {destination: dest})
		.then(() => {
			console.log(`${filename} uploaded to ${googleBucketReqs.bucketName}.`);
		}).catch(err => {
			console.error('ERROR:', err);
		}).finally(function() {
            fs.unlink(filename, err => {
                if (err) {
                    console.log('Failed to delete temporary file');
                }
            });
		});
		// [END storage_upload_file]
	},

	deleteFile: function(file) {
		googleBucketReqs.storage
		.bucket(googleBucketReqs.bucketName)
		.file(file).delete()
		.then(() => {
			console.log(`${file} deleted successfully.`);
		}).catch (err => {
			console.log('ERROR', err);
		});
	}
};