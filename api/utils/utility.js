const fs = require('fs');

// delete files from tmp directory since operation failed
exports.emptyDir = (dirname) => {
    console.log('in emptydir');
    var dirContents = fs.readdirSync(dirname, (fsReadDirErr) => {
    	if (fsReadDirErr) {
            resMessages.logError(fsReadDirErr);
            return resMessages.returnError(500, fsReadDirErr, 'fs.readDir()', res);
    	}
    });

    if (dirContents != undefined && dirContents.length > 0) {
        for (var i = 0; i < dirContents.length; i++) {
            fs.unlink(dirname + dirContents[i], (fsUnlinkErr) => {
                if (fsUnlinkErr) {
                    resMessages.logError(fsUnlinkErr);
                    return resMessages.returnError(500, fsUnlinkErr, 'fs.unlink()', res);
                }
            });
        }

        console.log('Files deleted');
    }
}
