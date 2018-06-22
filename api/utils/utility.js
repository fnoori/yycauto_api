const fs = require('fs');

// delete files from tmp directory since operation failed
exports.emptyDir = (dirname) => {
    console.log('in emptydir');
    var dirContents = fs.readdirSync(dirname, (err) => {
    	if (err) {
    		console.log('Failed to read directory');
    		return err;
    	}
    });

    if (dirContents != undefined && dirContents.length > 0) {
        for (var i = 0; i < dirContents.length; i++) {
            fs.unlink(dirname + dirContents[i], (err) => {
                if (err) {
                    console.log('Failed to delete file');
                    return err;
                }
            });
        }

        console.log('Files deleted');
    }
}
