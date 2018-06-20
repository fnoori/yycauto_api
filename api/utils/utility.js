const fs = require('fs');

// delete files from tmp directory since operation failed
exports.emptyDir = (dirname) => {
    var dirContents = fs.readdir(dirname, (err) => {
    	if (err) {
    		console.log('Failed to read directory');
    		return err;
    	}    	
    });

    if (dirContents != undefined && dirContents.length > 0) {
    	console.log(dirContents);
        fs.unlink(dirname + dirContents[0], (err) => {
	    	if (err) {
	    		console.log('Failed to delete file');
	    		return err;
	    	}
    	});
    }
}