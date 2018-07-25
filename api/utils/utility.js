const fs = require('fs');

// delete files from tmp directory since operation failed
exports.emptyDir = (dirname) => {
  var dirContents = fs.readdirSync(dirname);

  if (dirContents != undefined && dirContents.length > 0) {
    for (var i = 0; i < dirContents.length; i++) {
      fs.unlinkSync(dirname + dirContents[i]);
    }
  }
}
