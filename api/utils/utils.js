const fs = require('fs');
const tmpDir = 'uploads/tmp/';

exports.checkNewVehicleInputs = (newVehicleData) => {
  var newVehicleErrors = {};

  if (newVehicleData.make === undefined || newVehicleData.make.length <= 0)
    newVehicleErrors['make'] = null;
  if (newVehicleData.model === undefined || newVehicleData.model.length <= 0)
    newVehicleErrors['model'] = null;
  if (newVehicleData.type === undefined || newVehicleData.type.length <= 0)
    newVehicleErrors['type'] = null;
  if (newVehicleData.year === undefined || newVehicleData.year.length <= 0)
    newVehicleErrors['year'] = null;
  if (newVehicleData.exterior_colour === undefined || newVehicleData.exterior_colour.length <= 0)
    newVehicleErrors['exterior_colour'] = null;
  if (newVehicleData.initial === undefined || newVehicleData.initial.length <= 0)
    newVehicleErrors['initial'] = null;
  if (newVehicleData.kilometres === undefined || newVehicleData.kilometres.length <= 0)
    newVehicleErrors['kilometres'] = null;
  if (newVehicleData.fuel_type === undefined || newVehicleData.fuel_type.length <= 0)
    newVehicleErrors['fuel_type'] = null;
  if (newVehicleData.transmission === undefined || newVehicleData.transmission.length <= 0)
    newVehicleErrors['transmission'] = null;
  if (newVehicleData.recommended_fuel === undefined || newVehicleData.recommended_fuel.length <= 0)
    newVehicleErrors['recommended_fuel'] = null;

  console.log(newVehicleErrors);
  return;
}

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