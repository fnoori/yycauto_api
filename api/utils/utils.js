const fs = require('fs');
const tmpDir = 'uploads/tmp/';

exports.clearTmpDir = () => {
  var dirContents = fs.readdirSync(tmpDir);

  if (dirContents !== undefined && dirContents.length > 0) {
    for (var i = 0; i < dirContents.length; i++) {
      fs.unlink(tmpDir + dirContents[i])
      .then(() => {
      }).catch(unlinkErr => {
        return Error(unlinkErr);
      });
    }
  }
}

exports.deleteFilesFromTmpDir = (filenames) => {
  filenames.forEach(file => {
    fs.unlinkSync(file);
  });
}