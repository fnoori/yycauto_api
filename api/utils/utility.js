// delete files from tmp directory since operation failed
exports.emptyDir = (dirname) => {
    var dirContents = fs.readdirSync(dirname);

    if (dirContents.length > 0) {
        fs.unlink(dirname + dirContents[0]);
    }
}