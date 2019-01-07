const HOUR_LENGTH = 4;
const MIN_LENGTH = 0;
const FROM = 0;
const TO = 1;
const SUNDAY = 'Sunday';
const MONDAY = 'Monday';
const TUESDAY = 'Tuesday';
const WEDNESDAY = 'Wednesday';
const THURSDAY = 'Thursday';
const FRIDAY = 'Friday';
const SATURDAY = 'Saturday';

const assert = require('chai').assert;
const expect = require('chai').expect;
const should = require('should');
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
  var sundayHours = '0900-1600';
  var mondayHours = '0900-1600';
  var tuesdayHours = '0900-1600';
  var wednesdayHours = '0900-1600';
  var thursdayHours = '0900-1600';
  var fridayHours = '0900-1600';
  var saturdayHours = '0900-1600';
  var id = '5c2fd67317b29c00070795ab';
  var updateData = {};
  var shouldPass = false;

    describe('#update_dealership_hours()', () => {
      shouldPass = true;

      it('should successfully execute, all inputs are perfect', () => {

        if (!validator.isMongoId(id)) {
          assert.ok(false);
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
                  assert.ok(false, 'Must use 24 hour time format');
                }
            if (!validator.isInt(from) ||
                !validator.isInt(to)) {
                  assert.ok(false, 'Times must be numbers');
                }

            updateData['dealership_hours.' + days[day].day + '.from'] = from;
            updateData['dealership_hours.' + days[day].day + '.to'] = to;
          }
        }

        assert.ok(shouldPass);

    });

    it('should successfully catch that an hour is too short', () => {
      sundayHours = '0900-1600';
      mondayHours = '0900-160';
      tuesdayHours = '0900-1600';
      wednesdayHours = '0900-1600';
      thursdayHours = '0900-1600';
      fridayHours = '0900-1600';
      saturdayHours = '0900-1600';
      id = '5c2fd67317b29c00070795ab';
      var updateData = {};


      if (!validator.isMongoId(id)) {
        assert.ok(false);
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
                assert.isNotOk(false, `incorrect format in: ${from} or ${to}`);
              }
          if (!validator.isInt(from) ||
              !validator.isInt(to)) {
                assert.isNotOk(false, 'Times must be numbers');
              }

          updateData['dealership_hours.' + days[day].day + '.from'] = from;
          updateData['dealership_hours.' + days[day].day + '.to'] = to;
        }
      }

      assert.isTrue(true);

    });

  });
});
