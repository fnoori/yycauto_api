const fs = require('fs');
const tmpDir = 'uploads/tmp/';

exports.clearTmpDir = () => {
  var dirContents = fs.readdirSync(tmpDir);

  if (dirContents !== undefined && dirContents.length > 0) {
    for (var i = 0; i < dirContents.length; i++) {
      fs.unlinkSync(tmpDir + dirContents[i]);
    }
  }  
}

exports.deleteFilesFromTmpDir = (filenames) => {
  filenames.forEach(file => {
    fs.unlinkSync(tmpDir + file.split('.')[0]);
  });
}