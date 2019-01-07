var assert = require('assert');
const validator = require('validator');
const _ = require('underscore');
const mongoSanitize = require('mongo-sanitize');
const errorUtils = require('../api/utils/errorUtils');
const utils = require('../api/utils/utils');

/*
describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1,2,3].indexOf(4), -1);
    });
  });
});
*/

describe('Users', () => {
    describe('#update_dealership_hours()', () => {

      const sundayHours = '0900-1600';
      const mondayHours = '0900-1600';
      const tuesdayHours = '0900-1600';
      const wednesdayHours = '0900-1600';
      const thursdayHours = '0900-1600';
      const fridayHours = '0900-1600';
      const saturdayHours = '0900-1600';
      const id = '';

      it('should pass, when all correctly formatted arguments have been provided', () => {

        if (!validator.isMongoId(req.body.id)) {
          return res.status(400).json(errorUtils.error_message('Incorrect id format', 400));
        }

        const sunday = _.isUndefined(mongoSanitize(sundayHours)) ? { day: SUNDAY } : { day: SUNDAY, hours: mongoSanitize(sundayHours) };
        const monday = _.isUndefined(mongoSanitize(mondayHours)) ? { day: MONDAY } : { day: MONDAY, hours: mongoSanitize(mondayHours) };
        const tuesday = _.isUndefined(mongoSanitize(tuesdayHours)) ? { day: TUESDAY } : { day: TUESDAY, hours: mongoSanitize(tuesdayHours) };
        const wednesday = _.isUndefined(mongoSanitize(wednesdayHours)) ? { day: WEDNESDAY } : { day: WEDNESDAY, hours: mongoSanitize(wednesdayHours) };
        const thursday = _.isUndefined(mongoSanitize(thursdayHours)) ? { day: THURSDAY } : { day: THURSDAY, hours: mongoSanitize(thursdayHours) };
        const friday = _.isUndefined(mongoSanitize(fridayHours)) ? { day: FRIDAY } : { day: FRIDAY, hours: mongoSanitize(fridayHours) };
        const saturday = _.isUndefined(mongoSanitize(saturdayHours)) ? { day: SATURDAY } : { day: SATURDAY, hours: mongoSanitize(saturdayHours) };
        const days = [sunday, monday, tuesday, wednesday, thursday, friday, saturday];

        for (day in days) {
          // only if times are being changed for the day
          if (!_.isUndefined(days[day].hours)) {
            var from = days[day].hours.split('-')[0];
            var to = days[day].hours.split('-')[1];

            if (!utils.isLengthExact(from, HOUR_LENGTH) ||
                !utils.isLengthExact(to, HOUR_LENGTH)) {
                  return res.status(400).json(errorUtils.error_message('Must use 24 hour time format', 400));
                }
            if (!validator.isInt(from) ||
                !validator.isInt(to)) {
                  return res.status(400).json(errorUtils.error_message('Times must be numbers', 400));
                }

            updateData['dealership_hours.' + days[day].day + '.from'] = from;
            updateData['dealership_hours.' + days[day].day + '.to'] = to;
          }
        }

    });
  });
});
